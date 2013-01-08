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
    
    WebGIS.osm.setVisibility(true);
    WebGIS.gphy.setVisibility(false);
    WebGIS.gmap.setVisibility(false);
    WebGIS.ghyb.setVisibility(false);
    WebGIS.gsat.setVisibility(false);
    
};

WebGIS.baseGooglePhy = function(menuItem) {
    
    menuItem.parentMenu.ownerCt.setText("Google Physical");
    
    WebGIS.osm.setVisibility(false);
    WebGIS.gphy.setVisibility(true);
    WebGIS.gmap.setVisibility(false);
    WebGIS.ghyb.setVisibility(false);
    WebGIS.gsat.setVisibility(false);
    
};

WebGIS.baseGoogleSt = function(menuItem) {
    
    menuItem.parentMenu.ownerCt.setText("Google Streets");
    
    WebGIS.osm.setVisibility(false);
    WebGIS.gphy.setVisibility(false);
    WebGIS.gmap.setVisibility(true);
    WebGIS.ghyb.setVisibility(false);
    WebGIS.gsat.setVisibility(false);
    
};

WebGIS.baseGoogleHy = function(menuItem) {
    
    menuItem.parentMenu.ownerCt.setText("Google Satellite");
    
    WebGIS.osm.setVisibility(false);
    WebGIS.gphy.setVisibility(false);
    WebGIS.gmap.setVisibility(false);
    WebGIS.ghyb.setVisibility(false);
    WebGIS.gsat.setVisibility(true);
    
};

WebGIS.baseGoogleSat = function(menuItem) {
    
    menuItem.parentMenu.ownerCt.setText("Google Satellite");
    
    WebGIS.osm.setVisibility(false);
    WebGIS.gphy.setVisibility(false);
    WebGIS.gmap.setVisibility(false);
    WebGIS.ghyb.setVisibility(true);
    WebGIS.gsat.setVisibility(false);
    
};

WebGIS.getBaseLayers = function(mapProjection) {
	
	WebGIS.osm  = new OpenLayers.Layer.OSM();

	WebGIS.gphy = new OpenLayers.Layer.Google(
            "Google Physical",
            {type: google.maps.MapTypeId.TERRAIN, numZoomLevels: 20}
    );
	WebGIS.gmap = new OpenLayers.Layer.Google(
            "Google Streets", 
            {numZoomLevels: 20}
    );
	WebGIS.ghyb = new OpenLayers.Layer.Google(
            "Google Hybrid",
            {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
    );
	WebGIS.gsat = new OpenLayers.Layer.Google(
            "Google Satellite",
            {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
    );
    
	WebGIS.osm.projection  = WebGIS.mapProjection;
	WebGIS.gphy.projection = WebGIS.mapProjection;
	WebGIS.gmap.projection = WebGIS.mapProjection;
	WebGIS.ghyb.projection = WebGIS.mapProjection;
	WebGIS.gsat.projection = WebGIS.mapProjection;

    return [WebGIS.osm, WebGIS.ghyb, WebGIS.gphy, WebGIS.gmap, WebGIS.gsat];
};