/**
 *  Copyright (C) 2010 - 2014 CRP Henri Tudor
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
 * 
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
    	maxExtent: 			boundsMap,
    	controls:			[new OpenLayers.Control.LayerSwitcher()]/*,
    	controls: 			[ new OpenLayers.Control.NavToolbar({zoomWheelEnabled: true}) ]*/
    });
   
    WebGIS.registerIdentify(WebGIS.leftMap, this);
    WebGIS.registerIdentify(WebGIS.rightMap, this);

    WebGIS.leftMap.addLayers(WebGIS.getLeftBaseLayers());   
    WebGIS.rightMap.addLayers(WebGIS.getRightBaseLayers());
      
    WebGIS.leftMap.addControl(new OpenLayers.Control.ScaleLine());
    
	var pv_kwh =  new OpenLayers.Layer.WMS(
		"PV potential (amorph) (kWh/a)",
		//"http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map",
		"http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map",
	    {layers: "pv_potential_amo_elec", 
	     format: "image/png",
	     srsName: WebGIS.requestProjection,
	 	 transparent: "true",
	 	 projection: new OpenLayers.Projection(WebGIS.requestProjection)},
	    {isBaseLayer: false,  
	 	 visibility: true}
	);
	
	var pv_euro =  new OpenLayers.Layer.WMS(
		"PV potential (amorph) (€/a)",
		//"http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map",
		"http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map",
	    {layers: "pv_potential_amo_c_e", 
	     format: "image/png",
	     srsName: WebGIS.requestProjection,
	 	 transparent: "true",
	 	 projection: new OpenLayers.Projection(WebGIS.requestProjection)},
	    {isBaseLayer: false,  
	 	 visibility: true}
	);
	
	WebGIS.rightMap.addLayer(pv_kwh);
	WebGIS.rightMap.addLayer(pv_euro);
	
	WebGIS.initParallelEvents();
};




