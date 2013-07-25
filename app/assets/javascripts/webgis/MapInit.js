/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 29-11-2011
 *
 * The code that initializes and provides interaction for the map
 * in the home page.
 **/ 

//= require webgis/BaseLayers

var WebGIS = WebGIS || { };

WebGIS.leftMap = null;
WebGIS.rightMap = null;

WebGIS.proxy = "/home/geoproxy?url=";
OpenLayers.ProxyHost = "/home/geoproxy?url=";


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
Proj4js.defs["EPSG:3857"]  = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";
Proj4js.defs["EPSG:2154"]  = "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:27700"] = "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs"; 
Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs";
Proj4js.defs["EPSG:31467"] = "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs";


WebGIS.initMap = function () 
{
	var mapProjection = new OpenLayers.Projection(WebGIS.mapProjection);
    
    // Nothing will be displayed outside these bounds (Poland - Ireland)
    var boundsMap  = new OpenLayers.Bounds(-1015000, 5845000, 1100000, 8000000);  
    
    WebGIS.leftMap = new OpenLayers.Map("leftMap",{
      projection: 			mapProjection,
      displayProjection: 	new OpenLayers.Projection(WebGIS.displayProjection),
      units: 				"m",
      maxExtent: 			boundsMap,
      controls: []
    });
   
    WebGIS.registerIdentify(WebGIS.leftMap, this);

    WebGIS.leftMap.addLayers(WebGIS.getLeftBaseLayers()); 
    
    WebGIS.leftMap.events.register("mousemove", null, WebGIS.mapMouseMove);
    
    WebGIS.leftMap.addControl(new OpenLayers.Control.ScaleLine());
};

WebGIS.mapMouseMove = function(e) 
{
	var lonLat = WebGIS.leftMap.getLonLatFromPixel(e.xy);	
	WebGIS.updateCoords(lonLat);
};

WebGIS.zoomToCity = function () 
{  
	onLocationChanged(document.getElementById("city-dropdown").value);
};

// Adds a new layer to the map "on the fly"
WebGIS.addNewLayer = function (title, serviceURL, layerName, type)
{
    // Call OpenLayers.Layer.WMS.initialize()

    var params = { layers: layerName,      
                   format: "image/png",
                   srsName: WebGIS.requestProjection,
                   srs: WebGIS.requestProjection,
                   transparent: "true",
                   sld_body: WebGIS.getStyle(layerName, type)
                 };

    var options = { isBaseLayer: false,     
                    visibility:  false,   // By default layers are off
                    singleTile:  true,
           		 	transitionEffect: 'resize'
                  };
    
    //serviceURL = WebGIS.proxy + encodeURIComponent(serviceURL);

    var layer = new OpenLayers.Layer.WMS(title, serviceURL, params, options);

    WebGIS.leftMap.addLayer(layer);
    
    layer.events.register("visibilitychanged", this, WebGIS.toggleLayer);
};

// Remove all layers from the current map
WebGIS.clearLayers = function(alsoClearBaseLayers)
{
  alsoClearBaseLayers = alsoClearBaseLayers || false;
  var layers = WebGIS.leftMap.layers;
  var layersToRemove = [];

  for(var i = 0, len = layers.length; i < len; i++) {
    if(alsoClearBaseLayers || !layers[i].isBaseLayer) {
      layersToRemove.push(layers[i]);
    }
  }

  for(var i = 0, len = layersToRemove.length; i < len; i++) {
    WebGIS.leftMap.removeLayer(layersToRemove[i]);
  }
};


