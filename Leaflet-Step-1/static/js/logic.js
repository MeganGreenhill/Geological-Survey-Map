// Store our API endpoint as queryUrl
var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson';

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
  // Data markers reflect the magnitude of the earthquake in their size and colour.
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
      // Include popups that provide additional information about the earthquake when a marker is clicked.
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
        radius: Math.round(feature.properties.mag) * 5,
      });
    },
  });

  // Import data for tectonic plate later
  var tectonicPlatesLink = "static/data/PB2002_plates.json";
  var tectonicPlatesData = d3.json(tectonicPlatesLink);
  var tectonicPlates = L.geoJson(tectonicPlatesData);

  // Sending out earthquakes layer to the createMap function
  createMap(earthquakes, tectonicPlates)
};

function createMap(earthquakes, tectonicPlates) {

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
    Earthquakes: earthquakes,
    TectonicPlates: tectonicPlates
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

  // Create a legend that will provide context for the map data.
  var legend = L.control({position: 'bottomright'});

  function getColor(category) {
    if (category === 'Magnitude <2')
      return 'green';
    else if (category === 'Magnitude >2, <3')
      return 'yellow';
    else if (category === 'Magnitude >3, <4')
      return 'orange';
    else
      return 'red';
  }

  legend.onAdd = function (map) {
    var legendDiv = L.DomUtil.create('div', 'info legend'),
    categories = ['Magnitude <2','Magnitude >2, <3','Magnitude >3, <4','Magnitude >4'];
    labels = ['<strong>Earthquake Categories</strong>'];
    for (var i = 0; i < categories.length; i++) {
      labels.push(
        '<i class="circle" style="background:' + getColor(categories[i]) + '"></i>' + categories[i] + '')
    }
    legendDiv.innerHTML = labels.join('<br>');
    return legendDiv;
  }

  // Add the info legend to the map
  legend.addTo(myMap);
}
