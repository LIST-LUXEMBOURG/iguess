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
       
    DSS.buildsGML = new OpenLayers.Layer.Vector("BuildingsGML", {
        protocol: new OpenLayers.Protocol.HTTP({
            url: "assets/BuildingsFull.gml",
            format: new OpenLayers.Format.GML()
        }),
        styleMap: DSS.style,
        strategies: [new OpenLayers.Strategy.Fixed()]
    });

	DSS.map.addLayers([streets, DSS.buildsGML]);
	
	DSS.map.zoomIn();
	DSS.map.zoomIn();
}