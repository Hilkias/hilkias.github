'use strict';

// Call the function to get our location
getGeoLocation();

// Gets longitude and latitude of current location
function getGeoLocation() {
    const STATUS = document.getElementById('status');
    STATUS.innerHTML = 'Getting Location...';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const LAT = position.coords.latitude;
            const LONG = position.coords.longitude;

            // Combine the values
            const LOCALE = LAT + "," + LONG;
            console.log(`Lat and Long are: ${LOCALE}.`);


            // Call getCode function, send locale
            getCode(LOCALE);
        })
    } else {
        STATUS.innerHTML = "Your browser doesn't support Geolocation or it is not enabled!";
    } // end else
} //end getGeoLocation

// URL to request city data using latitude and longitude
// "https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=WZvTdK3lWnFfx2XJNtJCbcPzebd1h19y&q=43.816667%2C-111.783333"
// Get location code from API
function getCode(LOCALE) {
    const API_KEY = 'WZvTdK3lWnFfx2XJNtJCbcPzebd1h19y';
    const URL = 'https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=' + API_KEY + '&q=' + LOCALE;
    fetch(URL)
        .then(response => response.json())
        .then(function (data) {
            console.log('Json object from getCode function:');
            console.log(data);
            const locData = {}; // Create an empty object
            locData['key'] = data.Key; // Add the value to the object
            locData['name'] = data.LocalizedName;
            locData['postal'] = data.PrimaryPostalCode;
            locData['state'] = data.AdministrativeArea.LocalizedName;
            locData['stateAbbr'] = data.AdministrativeArea.ID;
            locData['geoposition'] = LOCALE;
            locData['elevation'] = data.GeoPosition.Elevation.Imperial.Value;
            getWeather(locData);
        })
        .catch(error => console.log('There was a getCode error: ', error))
} // end getCode function

// Get Current Weather data from API
function getWeather(locData) {
    const API_KEY = 'WZvTdK3lWnFfx2XJNtJCbcPzebd1h19y';
    const CITY_CODE = locData['key']; // We're getting data out of the object
    const URL = "https://dataservice.accuweather.com/currentconditions/v1/" + CITY_CODE + "?apikey=" + API_KEY + "&details=true";
    fetch(URL)
        .then(response => response.json())
        .then(function (data) {
            console.log('Json object from getWeather function:');
            console.log(data); // Let's see what we got back
            // Start collecting data and storing it
            locData['currentTemp'] = data[0].Temperature.Imperial.Value;
            locData['summary'] = data[0].WeatherText;
            locData['windSpeed'] = data[0].Wind.Speed.Imperial.Value;
            locData['windUnit'] = data[0].Wind.Speed.Imperial.Unit;
            locData['windDirection'] = data[0].Wind.Direction.Localized;
            locData['windGust'] = data[0].WindGust.Speed.Imperial.Value;
            locData['pastLow'] = data[0].TemperatureSummary.Past12HourRange.Minimum.Imperial.Value;
            locData['pastHigh'] = data[0].TemperatureSummary.Past12HourRange.Maximum.Imperial.Value;
            getHourly(locData); // Send data to getHourly function
        })
        .catch(error => console.log('There was an error: ', error))
} // end getWeather function

// Get next 12 hours of forecast data from API
function getHourly(locData) {
    const API_KEY = 'WZvTdK3lWnFfx2XJNtJCbcPzebd1h19y';
    const CITY_CODE = locData['key'];
    const URL = "https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/" + CITY_CODE + "?apikey=" + API_KEY;
    fetch(URL)
        .then(response => response.json())
        .then(function (data) {
            console.log('Json object from getHourly function:');
            console.log(data); // See what we got back
            // Get the first hour in the returned data
            let date_obj = new Date(data[0].DateTime);
            let nextHour = date_obj.getHours(); // returns 0 to 23
            // Store into the object
            locData["nextHour"] = nextHour;
            // Counter for the forecast hourly temps
            var i = 1;
            // Get the temps for the next 12 hours
            data.forEach(function (element) {
                let temp = element.Temperature.Value;
                let hour = 'hourTemp' + i;
                locData[hour] = temp; // Store hour and temp to object
                // New hiTemp variable, assign value from previous 12 hours
                let hiTemp = locData.pastHigh;
                // New lowTemp variable, assign value from previous 12 hours
                let lowTemp = locData.pastLow;
                // Check current forecast temp to see if it is 
                // higher or lower than previous hi or low
                if (temp > hiTemp) {
                    hiTemp = temp;
                } else if (temp < lowTemp) {
                    lowTemp = temp;
                }
                // Replace stored low hi and low temps if they changed
                if (hiTemp != locData.pastHigh) {
                    locData["pastHigh"] = hiTemp; // When done, this is today's high temp
                }
                if (lowTemp != locData.pastLow) {
                    locData["pastLow"] = lowTemp; // When done, this is today's low temp
                }
                i++; // Increase the counter by 1
            }); // ends the foreach method
            console.log('Finished locData object and data:');
            console.log(locData);
            buildPage(locData); // Send data to buildPage function
        })
        .catch(error => console.log('There was an error: ', error))
} // end getHourly function