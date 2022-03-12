// Create a map using Leaflet that plots all of the earthquakes from your data set based on their longitude and latitude.

// Your data markers should reflect the magnitude of the earthquake in their size and colour. Earthquakes with higher magnitudes should appear larger and darker in colour.

// Include popups that provide additional information about the earthquake when a marker is clicked.


// Store our API endpoint as queryUrl
var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_hour.geojson';

// Perform a GET request to the query URL to obtain GeoJSON from USGS outlining all M4.5+ earthquakes from the past day
d3.json(queryUrl).then(function(data) {
  console.log(data.features);
  // Once we get a response, send the data.features  object to the createFeatures function
  createFeatures(data.features)
});

function createFeatures(earthquakeData) {
  
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")
  }

  // Create a GeoJSON  layer containing the features array on the earthquake object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    style: function(feature) {
      var mag = feature.properties.mag;
      if (mag >= 4.0) {
        return {
          color: "red"
        }; 
      }
      else if (mag >= 3.0) {
        return {
          color: "orange"
        };
      } else if (mag >= 2.0) {
        return {
          color: "yellow"
        };
      } else {
        return {
          color: "green"
        }
      }
    },

    onEachFeature: function(feature, layer) {

      var popupText = "<b>Magnitude:</b> " + feature.properties.mag +
        "<br><b>Location:</b> " + feature.properties.place +
        "<br><a href='" + feature.properties.url + "'>More info</a>";

      layer.bindPopup(popupText, {
        closeButton: true,
        offset: L.point(0, -20)
      });
      layer.on('click', function() {
        layer.openPopup();
      });
    },

    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: Math.round(feature.properties.mag) * 3,
      });
    },
  });

  // Sending out earthquakes layer to the createMap function
  createMap(earthquakes)
};

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create an `overlayMaps` object using the newly created earthquake GeoJSON layer.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create a new map
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap]
  });

  // Create a layer control containing our baseMaps
  // Be sure to add an overlay Layer containing the earthquake GeoJSON
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}

// // Create a legend that will provide context for the map data.
// var info = L.control({
//   position: "bottomright"
// });
  
// // When the layer control is added, insert a div with the class of "legend"
// info.onAdd = function() {
//   var div = L.DomUtil.create("div", "legend");
//   return div;
// };

// Add the info legend to the map
// info.addTo(map);