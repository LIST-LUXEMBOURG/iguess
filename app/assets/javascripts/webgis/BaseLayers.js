/**
 * Copyright (C) 2010 - 2014 CRP Henri Tudor
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 08-01-2013
 *
 * Properties and methods to manage base layers.
 */ 

var WebGIS = WebGIS || { };

WebGIS.osmLeft;
WebGIS.gphyLeft;
WebGIS.gmapLeft;
WebGIS.ghybLeft;
WebGIS.gsatLeft;

WebGIS.osmRight;
WebGIS.gphyRight;
WebGIS.gmapRight;
WebGIS.ghybRight;
WebGIS.gsatRight;

WebGIS.baseOSM = function(menuItem) {
    
    menuItem.parentMenu.ownerCt.setText("Open Street Map");
    
    WebGIS.leftMap.setBaseLayer(WebGIS.osmLeft); 
    if (WebGIS.rightMap != null) 
    	WebGIS.rightMap.setBaseLayer(WebGIS.osmRight);
};

WebGIS.baseGooglePhy = function(menuItem) {
    
    menuItem.parentMenu.ownerCt.setText("Google Physical");
    
    WebGIS.leftMap.setBaseLayer(WebGIS.gphyLeft);
    if (WebGIS.rightMap != null) 
    	WebGIS.rightMap.setBaseLayer(WebGIS.gphyRight);
};

WebGIS.baseGoogleSt = function(menuItem) {
    
    menuItem.parentMenu.ownerCt.setText("Google Streets");
    
    WebGIS.leftMap.setBaseLayer(WebGIS.gmapLeft);
    if (WebGIS.rightMap != null) 
    	WebGIS.rightMap.setBaseLayer(WebGIS.gmapRight);
};

WebGIS.baseGoogleHy = function(menuItem) {
    
    menuItem.parentMenu.ownerCt.setText("Google Hybrid");
    
    WebGIS.leftMap.setBaseLayer(WebGIS.ghybLeft);
    if (WebGIS.rightMap != null) 
    	WebGIS.rightMap.setBaseLayer(WebGIS.ghybRight);
};

WebGIS.baseGoogleSat = function(menuItem) {
    
    menuItem.parentMenu.ownerCt.setText("Google Satellite");
    
    WebGIS.leftMap.setBaseLayer(WebGIS.gsatLeft);   
    if (WebGIS.rightMap != null) 
    	WebGIS.rightMap.setBaseLayer(WebGIS.gsatRight);
};

WebGIS.getLeftBaseLayers = function(mapProjection) {
	
	WebGIS.osmLeft  = new OpenLayers.Layer.OSM();

	WebGIS.gphyLeft = new OpenLayers.Layer.Google(
            "Google Physical",
            {type: google.maps.MapTypeId.TERRAIN, numZoomLevels: 20, animationEnabled: true, transitionEffect: 'resize'}
    );
	WebGIS.gmapLeft = new OpenLayers.Layer.Google(
            "Google Streets", 
            {numZoomLevels: 20, animationEnabled: true}
    );
	WebGIS.ghybLeft = new OpenLayers.Layer.Google(
            "Google Hybrid",
            {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20, animationEnabled: true}
    );
	WebGIS.gsatLeft = new OpenLayers.Layer.Google(
            "Google Satellite",
            {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22, animationEnabled: true}
    );
	
	WebGIS.osmLeft.animationEnabled = true;
    
	WebGIS.osmLeft.projection  = WebGIS.mapProjection;
	WebGIS.gphyLeft.projection = WebGIS.mapProjection;
	WebGIS.gmapLeft.projection = WebGIS.mapProjection;
	WebGIS.ghybLeft.projection = WebGIS.mapProjection;
	WebGIS.gsatLeft.projection = WebGIS.mapProjection;

    return [WebGIS.osmLeft, WebGIS.ghybLeft, WebGIS.gphyLeft, WebGIS.gmapLeft, WebGIS.gsatLeft];
};

WebGIS.getRightBaseLayers = function(mapProjection) {
	
	WebGIS.osmRight  = new OpenLayers.Layer.OSM();

	WebGIS.gphyRight = new OpenLayers.Layer.Google(
            "Google Physical",
            {type: google.maps.MapTypeId.TERRAIN, numZoomLevels: 20, animationEnabled: true, transitionEffect: 'resize', displayInLayerSwitcher: false}
    );
	WebGIS.gmapRight = new OpenLayers.Layer.Google(
            "Google Streets", 
            {numZoomLevels: 20, animationEnabled: true, displayInLayerSwitcher: false}
    );
	WebGIS.ghybRight = new OpenLayers.Layer.Google(
            "Google Hybrid",
            {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20, animationEnabled: true, displayInLayerSwitcher: false}
    );
	WebGIS.gsatRight = new OpenLayers.Layer.Google(
            "Google Satellite",
            {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22, animationEnabled: true, displayInLayerSwitcher: false}
    );
	
	WebGIS.osmRight.animationEnabled = true;
    
	WebGIS.osmRight.projection  = WebGIS.mapProjection;
	WebGIS.gphyRight.projection = WebGIS.mapProjection;
	WebGIS.gmapRight.projection = WebGIS.mapProjection;
	WebGIS.ghybRight.projection = WebGIS.mapProjection;
	WebGIS.gsatRight.projection = WebGIS.mapProjection;

    return [WebGIS.osmRight, WebGIS.ghybRight, WebGIS.gphyRight, WebGIS.gmapRight, WebGIS.gsatRight];
};