/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 29-11-2011
 *
 * The code that initializes and provides interaction for the map
 * in the home page.
 **/ 

  var WebGIS = WebGIS || { };

  WebGIS.map;
  /**
   * All layers will always use the base layer projection for the request.
   * Since we are using Google and OSM anything other than EPSG:900913 will be ignored.
   */
  //WebGIS.mapProjection = "EPSG:900913";
  WebGIS.mapProjection = "EPSG:3857";
  //WebGIS.requestProjection = "EPSG:900913";
  WebGIS.requestProjection = "EPSG:3857";
  WebGIS.displayProjection = "EPSG:4326";

  /**
   * In the future the proj4 string will have to be stored in the database.
   * For now only the Ludwigsburg projection is known so it is left hard coded here.
   */
  Proj4js.defs["EPSG:31467"] = "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs";
  Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs";
  Proj4js.defs["EPSG:3857"]  = "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ";

  WebGIS.initMap = function () {

	var mapProjection = new OpenLayers.Projection(WebGIS.mapProjection);
	
    var boundsInit = new OpenLayers.Bounds(995196.25, 6240993.46, 1057535.16, 6274861.39);    
    // Nothing will be displayed outside these bounds (Poland - Ireland)
    var boundsMap  = new OpenLayers.Bounds(-1015000, 5845000, 1100000, 8000000);  
    
    WebGIS.map = new OpenLayers.Map("BroadMap",{
      projection: mapProjection,
      displayProjection: new OpenLayers.Projection(WebGIS.displayProjection),
      units: "m",
      maxExtent: boundsMap,
      controls: []
    });

    var mp = new OpenLayers.Control.MousePosition({
      formatOutput: function(lonLat) {
        var markup = WebGIS.convertDMS(lonLat.lon, "LON") + "  ";
        markup += WebGIS.convertDMS(lonLat.lat, "LAT");
        return markup;
      }
    });
    WebGIS.map.addControl(mp);
    
    WebGIS.addIdentifyControl(WebGIS.map);

    var osm = new OpenLayers.Layer.OSM();

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
    
    osm.projection  = mapProjection;
    gphy.projection = mapProjection;
    gmap.projection = mapProjection;
    ghyb.projection = mapProjection;
    gsat.projection = mapProjection;

    WebGIS.map.addLayers([osm, ghyb, gphy, gmap, gsat]);

    /* This is layer is just for testing */
    var iBusLines = new OpenLayers.Layer.WMS(
            "iBus lines",
            "http://iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/Ludwigsburg02.map",
            {layers: "BusLines",
              format: "image/gif",
              srsName: WebGIS.requestProjection,
              transparent: "true"},
            {isBaseLayer: false,
              visibility: false}
    );

    //map.addLayers([iBusLines]);

    WebGIS.map.setCenter(boundsInit.getCenterLonLat(), 13);
  }

  WebGIS.zoomToCity = function () {
    onLocationChanged(document.getElementById("city-dropdown").value);
  }


  // Adds a new layer to the map "on the fly"
  WebGIS.addNewLayer = function (title, serviceURL, layerName)
  {
    var layer =  new OpenLayers.Layer.WMS(
            title,
            serviceURL,
            {layers: layerName,
              format: "image/png",
              srsName: WebGIS.requestProjection,
              srs: WebGIS.requestProjection,
              transparent: "true"},
            {isBaseLayer: false,
              visibility: true,
              singleTile: true}
    );

    WebGIS.map.addLayer(layer);
  }