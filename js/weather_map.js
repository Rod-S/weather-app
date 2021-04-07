$(document).ready(function() {
   "use strict";

    let cityInput = "";
    let geoCity;
    let cityLat;
    let cityLon;

   const getDate = addDay => {
       if (addDay >= 0) {
           var today = new Date();
           today.setDate(today.getDate()+addDay)
           var dd = String(today.getDate()).padStart(2, '0');
           var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
           var yyyy = today.getFullYear();
           if (addDay === 0) {
               var todayFormat = "(TODAY) " + yyyy + '-' + mm + "-" + dd;
           } else {
               var todayFormat = yyyy + '-' + mm + "-" + dd;
           }
       } else {
           var today = new Date();
           var dd = String(today.getDate()).padStart(2, '0');
           var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
           var yyyy = today.getFullYear();
           var todayFormat = yyyy + '-' + mm + "-" + dd;
       }
      return todayFormat;
   }

    // const getCoords = cityInput => {
    //     geocode(cityInput, mapboxToken).then(function(result) {
    //         cityLat = result[1];
    //         cityLon = result[0];
    //     });
    // }

   const convertWindSpeed = currentWind => {
       return (currentWind).toFixed(2);
   }

   //convert degrees to cardinal directions
   const convertDegtoCardinal = (deg) => {
           var val = Math.floor((deg / 22.5) + 0.5);
           var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
           return arr[(val % 16)];
   }

   const weatherTemplateBuilder = (daily, weekly) => {
       var cardTemplate = `<div id="weather-cards" class="container-fluid row justify-content-center mt-1"></div>`;
       if (daily) {
           var cardPrepend = `<div id="weather-cards-h1" class="mx-auto"><h3><u>CURRENT WEATHER</u></h3></div>`
       } else if (weekly) {
           cardPrepend = `<div id="weather-cards-h1" class="mx-auto"><h3><u>WEEKLY FORECAST</u></h3></div>`
       }
       $('#weather-cards').remove();
       $('#weather-cards-h1').remove();
       $('#currentCityText').html(`<strong>Current City:</strong> ${cityInput}`);
       $('#weatherRow').append(cardPrepend);
       $('#weatherRow').append(cardTemplate);
   }

   const dailyWeatherBuilder = obj => {
       var entryHTML ='';
       var iconUrl = "http://openweathermap.org/img/wn/" + obj.current.weather[0].icon + "@2x.png";
       entryHTML += `
            <div class="card justify-content-center mt-2">
                <div class="card-header text-center">Today's Date: ${getDate()}</div>
                <div class="card-body">
                        <p class="mb-0">Current Temperature: <strong>${Math.ceil(obj.current.temp)} °F</strong></p>
                        <p class="mb-0 text-center">(Feels Like: <strong>${Math.ceil(obj.current.feels_like)} °F)</strong></p>
                        <div class="weather-icon"><img src="${iconUrl}"></div>   
                        <div>                             
                            <p>High: <strong>${obj.daily[0].temp.max} °F</strong> / Low: <strong>${obj.daily[0].temp.min} °F</strong></p>
                            <p>Description: <strong>${obj.current.weather[0].description}</strong></p>
                            <p>Humidity: <strong>${obj.current.humidity}%</strong></p>
                            <p>Wind Speed: <strong>${convertWindSpeed(obj.current.wind_speed)} mph</strong></p>
                            <p>Wind Direction: <strong>${obj.current.wind?.direction?.code || convertDegtoCardinal(obj.current.wind_deg)}</strong></p>
                            <p>Pressure: <strong>${obj.current.pressure} hPa</strong></p>
                        </div>
                </div>
            </div>
            <br>
            <br>`
       return entryHTML;
    }

    const weeklyWeatherBuilder = objArr => {
        var entryHTML ='';
        objArr.daily.forEach((obj, index) => {
            if (index >= objArr.daily.length -3) return entryHTML;
            var iconUrl = "http://openweathermap.org/img/wn/" + obj.weather[0].icon + "@2x.png";
            entryHTML += `
                <div class="card justify-content-center mt-2">
                    <div class="card-header text-center">${getDate(index)}</div>
                    <div class="card-body">     
                            <p class="mb-0">High: <strong>${obj.temp.max} °F</strong> / Low: <strong>${obj.temp.min} °F</strong></p>
                            <div class="weather-icon"><img src="${iconUrl}"></div>   
                            <div>                             
                                <p class="mb-0">Description: <strong>${obj.weather[0].description}</strong></p>
                                <p class="mb-0">Humidity: <strong>${obj.humidity}%</strong></p>
                                <p class="mb-0">Wind Speed: <strong>${convertWindSpeed(obj.wind_speed)} mph</strong></p>
                                <p class="mb-0">Wind Direction: <strong>${convertDegtoCardinal(obj.wind_deg)}</strong></p>
                                <p class="mb-0">Pressure: <strong>${obj.pressure} hPa</strong></p>
                            </div>
                    </div>
                </div>
                <br>
                <br>`
            })
        return entryHTML;
    }

   const getCurrentWeather = city => {
       Promise.resolve(geocode(city, mapboxToken))
           .then(
               //success
               function(result) {
                   geoCity = city;
                   cityLat = result[1];
                   cityLon = result[0];
                   map.setCenter(result);
                   map.setZoom(8);
                   mapMarker.setLngLat(result).addTo(map);
                   $('#map').show();
               //fail
               }, function() {
                   $('#weather-cards').html("<p>Sorry, couldn't find that city.</p>");
           }).then(function() {
               $.get("http://api.openweathermap.org/data/2.5/onecall", {
                   APPID: OPEN_WEATHER_APPID,
                   lat: cityLat,
                   lon: cityLon,
                   units: "imperial"
               }).done(function (data) {
                   console.log(data);
                   $('#weather-cards').html(dailyWeatherBuilder(data));
                   $('.currentCity').html("<strong>"+"Current City: "+"</strong>" + city).css("text-transform", "capitalize");
               }).fail(function (data) {
                   $('#weather-cards').html("<p>Sorry, couldn't find that city.</p>");
                   $('.currentCity').html("<strong>"+"Current City: "+"</strong>" + city);
       })});
   }

    const getWeeklyWeather = city => {
       Promise.resolve(geocode(city, mapboxToken))
           .then(
               //success
               function(result) {
                   geoCity = city;
                   cityLat = result[1];
                   cityLon = result[0];
                   map.setCenter(result);
                   map.setZoom(10);
                   mapMarker.setLngLat(result).addTo(map);
                   $('#map').show();
               }, function() {
                   $('#weather-cards').html("<p>Sorry, couldn't find that city.</p>");
                   $('.currentCity').html("<strong>"+"Current City: "+"</strong>" + city);
           }).then(function() {
               $.get("https://api.openweathermap.org/data/2.5/onecall", {
                    appid: OPEN_WEATHER_APPID,
                    lat: cityLat,
                    lon: cityLon,
                    units: "imperial"
               }).done(function (data) {
            console.log(data);
            $('#weather-cards').html(weeklyWeatherBuilder(data));
            $('.currentCity').html("<strong>"+"Current City: "+"</strong>" + city).css("text-transform", "capitalize");
        }).fail(function () {
            $('#weather-cards').html("<p>Sorry, couldn't find that city.</p>");
            $('.currentCity').html("<strong>"+"Current City: "+"</strong>" + city);
        })});
    }

   function combineCurrent() {
       $('li').removeClass('active');
       $(this).toggleClass('active');
       weatherTemplateBuilder(true, null);
       if (cityInput != "") {
           getCurrentWeather(geoCity || cityInput);
       }
   }

   function combineWeekly() {
       $('li').removeClass('active');
       $(this).toggleClass('active');
       weatherTemplateBuilder(null, true);
       if (cityInput != "") {
           getWeeklyWeather(geoCity || cityInput);
       }
   }

   ///////////////////
    //MAPBOX FNs//////
   ///////////////////
    mapboxgl.accessToken = mapboxToken;

    var mapboxOptions = {
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        zoom: 20,
    }
    var map = new mapboxgl.Map(mapboxOptions);
    var mapMarker = new mapboxgl.Marker({
        draggable: true
    });

    function onDragEnd() {
        var lngLat = mapMarker.getLngLat();

        cityLat = lngLat.lat
        cityLon = lngLat.lng
        console.log("cityLat "+cityLat);
        console.log("cityLon " +cityLon);
        reverseGeocode({lng: cityLon, lat: cityLat}, mapboxToken)
            .then(
            //success
            function(result) {
                geoCity = result;
                cityInput = result.split(', ')
                cityInput = cityInput[cityInput.length-3] + ", " +cityInput[cityInput.length-2]
                var mapMarkerSearch = result.split(', ')[1].trim() + ", " + result.split(', ')[2].trim();
               if ($('#currentWeather').hasClass('active')) {
                   getCurrentWeather(cityInput);
               } else {
                   getWeeklyWeather(result);
               }
                $('#map').show();
            //fail
            }, function() {
                $('#weather-cards').html("<p>Sorry, couldn't find that city.</p>");
                $('.currentCity').html("<strong>"+"Current City: "+"</strong>" + city);
            })
    }
    mapMarker.on('dragend', onDragEnd);

    ///////////////////
    //EVENT HANDLERS//
    //////////////////
    $('#currentWeather').on("click", combineCurrent);
    $('#weeklyWeather').on("click", combineWeekly);

    $('#searchBtn').on('click', function(e) {
            e.preventDefault();
            // cityInput =  cityInput == "" ? $('#citySearchText').val() : cityInput;
        cityInput = $('#citySearchText').val();
            if (cityInput.trim() === "") {return}
            if ($('#currentWeather').hasClass('active')) {
                getCurrentWeather(cityInput);
            } else {
                getWeeklyWeather(cityInput);
            }
        }
    )
    $('#clearBtn').on('click', function(e) {
        e.preventDefault();
        cityInput = $('#citySearchText').val('');
    })

    $('#citySearchText').on("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('#searchBtn').click();
        }
    });

    $('#map').hide();

});