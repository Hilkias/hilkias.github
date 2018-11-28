//'use strict';





// Gets longitude and latitude of current location
function getGeoLocation() {

} // end getGeoLocation

const STATUS = document.getElementById('status');
STATUS.innerHTML = 'Getting Location...';

// Call the function to get our location
getGeoLocation();

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
     const LAT = position.coords.latitude;
     const LONG = position.coords.longitude;
  
     // Combine the values
     const LOCALE = LAT + "," + LONG;
     console.log(`Lat and Long are: ${LOCALE}.`);
  
  
    })
   } else {
    STATUS.innerHTML = "Your browser doesn't support Geolocation or it is not enabled!";
   } // end else
  } //end getGeoLocation
