/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 08-01-2013
 *
 * Properties and methods to manage base layers.
 */ 

var WebGIS = WebGIS || { };

WebGIS.osm;
WebGIS.gphy;
WebGIS.gmap;
WebGIS.ghyb;
WebGIS.gsat;

WebGIS.baseOSM = function(menuItem) {
    
    menuItem.parentMenu.ownerCt.setText("Open Street Map");
    
    WebGIS.leftMap.setBaseLayer(WebGIS.osm); 
    WebGIS.rightMap.setBaseLayer(WebGIS.osm);
};

WebGIS.baseGooglePhy = function(menuItem) {
    
    menuItem.parentMenu.ownerCt.setText("Google Physical");
    
    WebGIS.leftMap.setBaseLayer(WebGIS.gphy);
    WebGIS.rightMap.setBaseLayer(WebGIS.gphy);
};

WebGIS.baseGoogleSt = function(menuItem) {
    
    menuItem.parentMenu.ownerCt.setText("Google Streets");
    
    WebGIS.leftMap.setBaseLayer(WebGIS.gmap);
    WebGIS.rightMap.setBaseLayer(WebGIS.gmap);
};

WebGIS.baseGoogleHy = function(menuItem) {
    
    menuItem.parentMenu.ownerCt.setText("Google Hybrid");
    
    WebGIS.leftMap.setBaseLayer(WebGIS.ghyb);
    WebGIS.rightMap.setBaseLayer(WebGIS.ghyb);
};

WebGIS.baseGoogleSat = function(menuItem) {
    
    menuItem.parentMenu.ownerCt.setText("Google Satellite");
    
    WebGIS.leftMap.setBaseLayer(WebGIS.gsat);   
    WebGIS.rightMap.setBaseLayer(WebGIS.gsat);
};

WebGIS.getBaseLayers = function(mapProjection) {
	
	WebGIS.osm  = new OpenLayers.Layer.OSM();

	WebGIS.gphy = new OpenLayers.Layer.Google(
            "Google Physical",
            {type: google.maps.MapTypeId.TERRAIN, numZoomLevels: 20, animationEnabled: true, transitionEffect: 'resize'}
    );
	WebGIS.gmap = new OpenLayers.Layer.Google(
            "Google Streets", 
            {numZoomLevels: 20, animationEnabled: true}
    );
	WebGIS.ghyb = new OpenLayers.Layer.Google(
            "Google Hybrid",
            {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20, animationEnabled: true}
    );
	WebGIS.gsat = new OpenLayers.Layer.Google(
            "Google Satellite",
            {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22, animationEnabled: true}
    );
	
	WebGIS.osm.animationEnabled = true;
    
	WebGIS.osm.projection  = WebGIS.mapProjection;
	WebGIS.gphy.projection = WebGIS.mapProjection;
	WebGIS.gmap.projection = WebGIS.mapProjection;
	WebGIS.ghyb.projection = WebGIS.mapProjection;
	WebGIS.gsat.projection = WebGIS.mapProjection;

    return [WebGIS.osm, WebGIS.ghyb, WebGIS.gphy, WebGIS.gmap, WebGIS.gsat];
};