
function plotLaureates(){

    var geolocationUrl = "http://nominatim.openstreetmap.org/search?";
    var laureatesFile = read("laureates.json");

    laureatesFile.then(function(data){
        var laureates = JSON.parse(data).laureates;
        var laureatesByCityBorn = {};
        for( var i in laureates) {
            var laureate = laureates[i];
            var bornCity = unescape(laureate.bornCity);
            if(laureatesByCityBorn[bornCity] === undefined){
                laureatesByCityBorn[bornCity] = {
                                                    count : 1, 
                                                    laureates : [laureate]
                                                };
            } else {
                laureatesByCityBorn[bornCity].count += 1;
                laureatesByCityBorn[bornCity].laureates.push(laureate);
            }
        }

        return laureatesByCityBorn;

    }).then(function(laureatesByCityBorn){
        _.map(laureatesByCityBorn, function(value, key){
            var params = "q="+key+"&format=json&limit=1";
            value.geolocation = read(geolocationUrl+params);
        });
        
        return laureatesByCityBorn;
    }).then(function(laureatesByCityBorn){
        var cities = [];
        for(var city in laureatesByCityBorn){
            var laureate = laureatesByCityBorn[city];

            getLatLon(laureate.geolocation).then(function(latLon){
                cities.push(Promise.resolve({"city_name": city, "lat": latLon.lat, "long": latLon.lon, "nb_laureates": laureate.count}));
            });
        }
        return cities;

    }).then(function(cities){

        Promise.all(cities, function(cities){

            // initialize tooltips
            $.fn.qtip.defaults.style.classes = 'ui-tooltip-bootstrap';
            $.fn.qtip.defaults.style.def = false;

            var map = kartograph.map('#map');

            map.loadMap('DE.svg', function() {
                map.addLayer('context', {
                    styles: {
                        stroke: '#aaa',
                        fill: '#f6f4f2'
                    }
                });
                map.addLayer('regions', {
                    id: 'bg',
                    styles: {
                        stroke: '#d8d6d4',
                        'stroke-width': 10,
                        'stroke-linejoin': 'round'
                    }
                });

                map.addLayer('regions', {
                    title: function(d) { return d.name },
                    styles: {
                        stroke: '#333',
                        fill: '#fff'
                    }
                });

                var scale = kartograph.scale.sqrt(cities.concat([{ nb_laureates: 0 }]), 'nb_laureates').range([0, 60]);

                map.addSymbols({
                    type: kartograph.Bubble,
                    data: cities,
                    location: function(city) {
                        return [city.long, city.lat];
                    },
                    radius: function(city) {
                        return scale(city.nb_visits);
                    },
                    tooltip: function(city) {
                        return '<h3>'+city.city_name+'</h3>'+city.nb_laureates+' laureates';
                    },
                    sortBy: 'radius desc',
                    style: 'fill:#800; stroke: #fff; fill-opacity: 0.5;',
                });
            });

        });

    });
}