'use strict';

/**
* Write your function to query for the weather forcast
*/
function weatherQuery(position) {
    var weatherApi = 'http://forecast.weather.gov/MapClick.php?lat=' + position.lat + '&lon=' + position.lng + '&FcstType=json';

    var weatherPromise = new Promise(function (resolve, reject) {
        var weatherRequest = new XMLHttpRequest();
        weatherRequest.addEventListener('load', function () {
            if (weatherRequest.readyState === weatherRequest.DONE) {
                if (weatherRequest.status === 200) {
                    var response = JSON.parse(weatherRequest.response);
                    console.log(response);
                    console.log(response.creationDateLocal);
                    console.log(response.data.temperature);
                    resolve(response);
                } else {
                    reject(weatherRequest.status);
                }
            }
        });
        weatherRequest.open('GET', weatherApi);
        weatherRequest.send();
    });

    return weatherPromise;
}

/**
 * You can use this function to create something that can render the weather.
 */
function weatherWindow(weather) {

    var startPeriodNames = weather.time.startPeriodName;
    var temperatures = weather.data.temperature;
    var weatherDesc = weather.data.weather;

    var weatherNode = document.createElement('table');
    weatherNode.classList.add('weather-table');

    var weatherRow = document.createElement('tr');
    weatherRow.appendChild(weatherCell(startPeriodNames[0]));
    weatherRow.appendChild(weatherCell(temperatures[0]));
    weatherRow.appendChild(weatherCell(weatherDesc[0]));
    weatherNode.appendChild(weatherRow);

    var infoWindow = new google.maps.InfoWindow({
        content: weatherNode
    });

    return infoWindow;
}

/**
 * You can use this function to set a marker on the map.
 */
function markLocation(map, position) {
    var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: 'Weather'
    });

    return marker;
}

/**
 * Maybe this function can put it all together
 */
function renderWeather(map, location, weather) {
    var weatherMarker = markLocation(map, location);
    var weatherWin = weatherWindow(weather);
    weatherWin.open(map, weatherMarker);
    weatherMarker.addListener('click', function () {
        weatherWin.open(map, weatherMarker);
    });
}

/**
 * You can use this function to choose where to center the map.
 */
function findCenter() {
    var centerPromise = new Promise(function (resolve, reject) {
        var myLatLng = {};
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                myLatLng.lat = position.coords.latitude;
                myLatLng.lng = position.coords.longitude;
                resolve(myLatLng);
            });
        } else { 
            alert("Geolocation is not supported by this browser.");
            reject("fail");
        }
    });

    return centerPromise;
}

function weatherCell(data) {
    var weatherCell = document.createElement('td');
    weatherCell.innerHTML = data;
    return weatherCell;
}

function initMap() {

    findCenter('1660 klockner rd, Hamilton, NJ').then(function (center) {
        var map = new google.maps.Map(document.getElementById('map'), {
            center: center,
            zoom: 15
        });

        weatherQuery(center).then(function (weather) {
            renderWeather(map, center, weather);
        });

        google.maps.event.addListener(map, 'click', function (event) {
            console.log(event);

            var clickLocation = { lat: event.latLng.lat(), lng: event.latLng.lng() };

            weatherQuery(clickLocation).then(function (weather) {
                renderWeather(map, clickLocation, weather);
            });
        });
    });
}