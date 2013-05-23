/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 13-05-2013
 *
 * Methods to initiate the map and layers.
 */ 

var DSS = DSS || { };

DSS.map = null;
 
DSS.mapProjection = "EPSG:28992";
 
// Avoid pink error tiles
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
OpenLayers.Util.onImageLoadErrorColor = "transparent";
 
DSS.buildsGML = null;
 
//create a style object
DSS.style = new OpenLayers.Style();
//rule used for all polygons
DSS.rule_fsa = new OpenLayers.Rule({
	symbolizer: {
		fillColor: "#DDDD00",
		fillOpacity: 0.6,
		strokeColor: "#DDDD00",
		strokeWidth: 1,
	}
});

DSS.rule_highlight = new OpenLayers.Rule({
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.GREATER_THAN,
		property: "cat",
		value: 1000,
	}),
	symbolizer: {
		fillColor: "#FF7144",
		fillOpacity: 0.5,
		strokeColor: "#FF7144",
		strokeWidth: 2,
		strokeDashstyle: "solid",
	}
});

DSS.style.addRules([DSS.rule_fsa, DSS.rule_highlight]);

DSS.initMap = function()
{
	//debugger;
	
	var bounds = new OpenLayers.Bounds(91979, 436326, 92617, 437659.5);

	DSS.map = new OpenLayers.Map("SliderMap",{
		projection: new OpenLayers.Projection(DSS.mapProjection),
		units: "m",
		maxExtent: bounds,
		controls: []
	});
	
	DSS.map.addControl(new OpenLayers.Control.LayerSwitcher());
	DSS.map.addControl(new OpenLayers.Control.Navigation());
	DSS.map.addControl(new OpenLayers.Control.PanZoom());
	
	var streets =  new OpenLayers.Layer.WMS(
    	"Streets",
    	"http://weastflows.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/Rotterdam02.map",
        {layers: "Streets", 
         format: "image/png",
         srsName: DSS.mapProjection,
	 	 transparent: "true",
     	 projection: new OpenLayers.Projection(DSS.mapProjection)},
        {isBaseLayer: true,  
     	 visibility: true}
    );
	
	var buildsWMS =  new OpenLayers.Layer.WMS(
    	"BuildingsWMS",
    	"http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map",
        {layers: "RO_buildings_gml", 
         format: "image/png",
         srsName: DSS.mapProjection,
	 	 transparent: "true",
     	 projection: new OpenLayers.Projection(DSS.mapProjection)},
        {isBaseLayer: false,  
     	 visibility: true}
    );
       
    DSS.buildsGML = new OpenLayers.Layer.Vector("BuildingsGML", {
        protocol: new OpenLayers.Protocol.HTTP({
            url: "assets/BuildingsFull.gml",
        	//url: "http://services.iguess.tudor.lu/pywps/sampleData/BuildingsFull.gml",
            format: new OpenLayers.Format.GML()
        }),
        styleMap: DSS.style,
        strategies: [new OpenLayers.Strategy.Fixed()]
    });
    
    //var propertyNames = ["fid", "cat", "DESCRIPTIO", "msGeometry"];
    
    buildsWFS = new OpenLayers.Layer.Vector("BuildingsWFS", {
        strategies: [new OpenLayers.Strategy.Fixed()],
        projection: new OpenLayers.Projection(DSS.mapProjection),
        protocol: new OpenLayers.Protocol.WFS({
            url: "http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map",
            //propertyNames: propertyNames,
            //geometryName: "msGeometry",
            featureType: "RO_buildings_gml",
            //"featurePrefix": "ms",
            //featureNS: "http://services.iguess.tudor.lu/",
            featureNS: "http://mapserver.gis.umn.edu/mapserver",
            srsName: DSS.mapProjection
            //"maxFeatures": 1000,
            //"version": "1.0.0",
            //outputFormat: "application/gml",
            //readFormat: new OpenLayers.Format.GML()
        })
    });
    


	DSS.map.addLayers([streets, /*buildsWMS,*/ DSS.buildsGML/*, buildsWFS*/]);
	
	DSS.map.zoomIn();
	DSS.map.zoomIn();
}