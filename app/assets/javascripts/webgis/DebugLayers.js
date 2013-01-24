/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 24-01-2013
 *
 * Methods that add debug layers to the WebGIS.
 * Used to test the WebGIS in case the Data Manager isn't working properly.
 */ 

var WebGIS = WebGIS || { };

WebGIS.addDebugLayersML = function() {

	var oroML =  new OpenLayers.Layer.WMS(
    	"Orography",
    	"http://montreuil.dynmap.com/carte_pour_iguess/carteWS.php",
        {layers: "Ligne_orographique_grp", 
         format: "image/png",
         srsName: WebGIS.requestProjection,
	 	 transparent: "true",
     	 projection: new OpenLayers.Projection(WebGIS.requestProjection)},
        {isBaseLayer: false,  
     	 visibility: false}
    );
	
	var buildsRemML =  new OpenLayers.Layer.WMS(
    	"Buildings - relevant",
    	"http://montreuil.dynmap.com/carte_pour_iguess/carteWS.php",
        {layers: "Bati_remarquable", 
         format: "image/png",
         srsName: WebGIS.requestProjection,
	 	 transparent: "true",
     	 projection: new OpenLayers.Projection(WebGIS.requestProjection)},
        {isBaseLayer: false,  
     	 visibility: false}
    );
	
	var buildsInduML =  new OpenLayers.Layer.WMS(
    	"Buildings - industrial",
    	"http://montreuil.dynmap.com/carte_pour_iguess/carteWS.php",
        {layers: "Bati_industriel", 
         format: "image/png",
         srsName: WebGIS.requestProjection,
	 	 transparent: "true",
     	 projection: new OpenLayers.Projection(WebGIS.requestProjection)},
        {isBaseLayer: false,  
     	 visibility: false}
    );

	var buildsIndiffML =  new OpenLayers.Layer.WMS(
    	"Buildings - indifferenced",
    	"http://montreuil.dynmap.com/carte_pour_iguess/carteWS.php",
        {layers: "BATI_INDIFFERENCIE", 
         format: "image/png",
         srsName: WebGIS.requestProjection,
	 	 transparent: "true",
     	 projection: new OpenLayers.Projection(WebGIS.requestProjection)},
        {isBaseLayer: false,  
     	 visibility: false}
    );

    WebGIS.map.addLayer(oroML);
    WebGIS.map.addLayer(buildsRemML);
    WebGIS.map.addLayer(buildsInduML);
    WebGIS.map.addLayer(buildsIndiffML);

};

WebGIS.addDebugLayersLB = function() {
	
	var busLB =  new OpenLayers.Layer.WMS(
    	"Bus lines",
    	"http://logis.ludwigsburg.de/mapguide2011/mapagent/mapagent.fcgi",
        {layers: "Ludwigsburg/3_Layer/buslinien", 
         format: "image/png",
         srsName: WebGIS.requestProjection,
	 	 transparent: "true",
     	 projection: new OpenLayers.Projection(WebGIS.requestProjection)},
        {isBaseLayer: false,  
     	 visibility: false}
    );
    
    var buildsLB =  new OpenLayers.Layer.WMS(
    	"Buildings",
    	"http://logis.ludwigsburg.de/mapguide2011/mapagent/mapagent.fcgi",
        {layers: "Ludwigsburg/3_Layer/gebaeude_lb_3857", 
         format: "image/png",
         srsName: WebGIS.requestProjection,
	 	 transparent: "true",
     	 projection: new OpenLayers.Projection(WebGIS.requestProjection)},
        {isBaseLayer: false,  
     	 visibility: false}
    );
    
    var streetsLB =  new OpenLayers.Layer.WMS(
    	"Streets",
    	"http://logis.ludwigsburg.de/mapguide2011/mapagent/mapagent.fcgi",
        {layers: "Ludwigsburg/3_Layer/Straßennamen", 
         format: "image/png",
         srsName: WebGIS.requestProjection,
	 	 transparent: "true",
     	 projection: new OpenLayers.Projection(WebGIS.requestProjection)},
        {isBaseLayer: false,  
     	 visibility: false}
    );
   
     WebGIS.map.addLayer(busLB);
     WebGIS.map.addLayer(buildsLB);
     WebGIS.map.addLayer(streetsLB);
};

WebGIS.addDebugLayersRO = function() {
	
	var buildsIGUESS =  new OpenLayers.Layer.WMS(
		"Builds iGUESS",
		"http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map",
	    {layers: "RO_building_footprints", 
	     format: "image/png",
	     srsName: WebGIS.requestProjection,
	 	 transparent: "true",
	 	 projection: new OpenLayers.Projection(WebGIS.requestProjection)},
	    {isBaseLayer: false,  
	 	 visibility: false}
	);

	WebGIS.map.addLayer(buildsIGUESS);
	
};