//////////////////////////////////////////////////////////////////
  // Author: Luís de Sousa
  // Date: 29-11-2011
  // The code that initializes and provides interaction for the map
  // in the home page.

  var map;
  var mapProjection = "EPSG:900913";
  var requestProjection = "EPSG:3857";
  // var requestProjection = "EPSG:900913";
  var displayProjection = "EPSG:4326";

  /* ****************************************************************************
   * In the future the proj4 string will have to be stored in the database.
   * For now only the Ludwigsburg projection is known so it is left hard coded here.
   */

  Proj4js.defs["EPSG:31467"] = "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs";
  Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs";
  Proj4js.defs["EPSG:3857"]  = "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ";

  function initMap() {


    var boundsInit = new OpenLayers.Bounds(995196.25, 6240993.46, 1057535.16, 6274861.39);    
    var boundsMap  = new OpenLayers.Bounds(-1015000, 5845000, 1100000, 8000000);  // Nothing will be displayed outside these bounds (Poland - Ireland)

    // var bounds = new OpenLayers.Bounds(995196.25, 6240993.46, 1057535.16, 6274861.39);

    map = new OpenLayers.Map("BroadMap",{
      projection: new OpenLayers.Projection(mapProjection),
      displayProjection: new OpenLayers.Projection(displayProjection),
      units: "m",
      maxExtent: boundsMap,
      controls: []
    });

    var mp = new OpenLayers.Control.MousePosition({
      formatOutput: function(lonLat) {
        var markup = convertDMS(lonLat.lon, "LON") + "  ";
        markup += convertDMS(lonLat.lat, "LAT");
        return markup;
      }
    });

    map.addControl(mp);
    //map.addControl(new OpenLayers.Control.LayerSwitcher());


    // Add OpenStreetMap layers
    map.addLayer(new OpenLayers.Layer.OSM());
    //map.addLayer(new OpenLayers.Layer.OSM.Mapnik("Mapnik"));
    //map.addLayer(new OpenLayers.Layer.OSM.Osmarender("Tiles@Home"));
    //map.addLayer(new OpenLayers.Layer.OSM.CycleMap("Cyclemap"));

    var gphy = new OpenLayers.Layer.Google(
            "Google Physical",
            {type: google.maps.MapTypeId.TERRAIN, numZoomLevels: 20}
    );
    var gmap = new OpenLayers.Layer.Google(
            "Google Streets", // the default
            {numZoomLevels: 20}
    );
    var ghyb = new OpenLayers.Layer.Google(
            "Google Hybrid",
            {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
    );
    var gsat = new OpenLayers.Layer.Google(
            "Google Satellite",
            {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
    );

    map.addLayers([ghyb, gphy, gmap, gsat]);

    /* This is layer is just for testing */
    var iBusLines = new OpenLayers.Layer.WMS(
            "iBus lines",
            "http://iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/Ludwigsburg02.map",
            {layers: "BusLines",
              format: "image/gif",
              srsName: requestProjection,
              srs: requestProjection,
              transparent: "true"},
            {isBaseLayer: false,
              visibility: false}
    );

    //map.addLayers([iBusLines]);

    map.setCenter(boundsInit.getCenterLonLat(), 13);
  }

  function zoomToCity() {
    onLocationChanged(document.getElementById("city-dropdown").value);
  }

  //////////////////////////////////////////////////////////////////
  // Author: Luís de Sousa
  // Date: 07-03-2012
  // Adds a new layer to the map "on the fly"

  function addNewLayer(title, serviceURL, layerName)
  {
    var layer =  new OpenLayers.Layer.WMS(
            title,
            serviceURL,
            {layers: layerName,
              format: "image/png",
              srsName: requestProjection,
              srs: requestProjection,
              transparent: "true"},
            {isBaseLayer: false,
              visibility: true}
    );

    map.addLayer(layer);
  }