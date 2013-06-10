/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 27-05-2013
 *
 * Initialises the parallel map.
 **/ 

//= require webgis/BaseLayers

var WebGIS = WebGIS || { };

WebGIS.initMapParallel = function () {

	var mapProjection = new OpenLayers.Projection(WebGIS.mapProjection);
    
    // Nothing will be displayed outside these bounds (Poland - Ireland)
    var boundsMap  = new OpenLayers.Bounds(-1015000, 5845000, 1100000, 8000000);  
    
    WebGIS.leftMap = new OpenLayers.Map("leftMap",{
      projection: 			mapProjection,
      displayProjection: 	new OpenLayers.Projection(WebGIS.displayProjection),
      units: 				"m",
      maxExtent: 			boundsMap,
      controls: 			[]
    });
    
    WebGIS.rightMap = new OpenLayers.Map("rightMap",{
    	projection: 		mapProjection,
    	displayProjection: 	new OpenLayers.Projection(WebGIS.displayProjection),
    	units: 				"m",
    	maxExtent: 			boundsMap/*,
    	controls: 			[ new OpenLayers.Control.NavToolbar({zoomWheelEnabled: true}) ]*/
    });
   
    WebGIS.registerIdentify(WebGIS.leftMap, this);
    WebGIS.registerIdentify(WebGIS.rightMap, this);

    WebGIS.leftMap.addLayers(WebGIS.getLeftBaseLayers());   
    WebGIS.rightMap.addLayers(WebGIS.getRightBaseLayers());
    
    WebGIS.initParallelEvents();
    
    WebGIS.leftMap.addControl(new OpenLayers.Control.ScaleLine());
};




