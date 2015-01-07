function read(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200 || req.status == 0) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

function getLatLon(geoLocation){

  return new Promise(function(resolve, reject){

    geoLocation.then(function(data){
                    
      var lat = JSON.parse(data)[0].lat;
      var lon = JSON.parse(data)[0].lon;

      resolve({"lat": lat, "lon":lon});

    }, function(response){
        reject(response);
    });

  });

}