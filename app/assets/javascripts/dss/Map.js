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
 * 
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 13-05-2013
 *
 * Methods to initiate the map and layers.
 */ 

var DSS = DSS || { };

DSS.map = null;

DSS.protocol = null;
 
Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs"; 
DSS.mapProjection = "EPSG:28992";
 
// Avoid pink error tiles
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
OpenLayers.Util.onImageLoadErrorColor = "transparent";
 
DSS.buildsWFS = null;
 
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
		type: OpenLayers.Filter.Comparison.LESS_THAN,
		property: "cum_multi",
		value: 0,
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
	 	 untiled: "tre",
     	 projection: new OpenLayers.Projection(DSS.mapProjection)},
        {isBaseLayer: true,  
     	 visibility: true}
    );
	
	var buildsWMS =  new OpenLayers.Layer.WMS(
    	"Buildings",
    	"http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map",
        {layers: "RO_buildings_gml", 
         format: "image/png",
         srsName: DSS.mapProjection,
	 	 transparent: "true",
     	 projection: new OpenLayers.Projection(DSS.mapProjection)},
        {isBaseLayer: false,  
     	 visibility: true}
    );
	
	var potential =  new OpenLayers.Layer.WMS(
	    	"pv_potential_wms",
	    	"http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map",
	        {layers: "pv_potential", 
	         format: "image/png",
	         srsName: DSS.mapProjection,
		 	 transparent: "true",
	     	 projection: new OpenLayers.Projection(DSS.mapProjection)},
	        {isBaseLayer: false,  
	     	 visibility: true}
	    );
	
	DSS.buildsWFS = new OpenLayers.Layer.Vector("pv_potential", {
		strategies: [new OpenLayers.Strategy.Fixed()],
		styleMap: DSS.style,
		projection: new OpenLayers.Projection(DSS.mapProjection),
		protocol: new OpenLayers.Protocol.WFS({
			version: "1.1.0",
			url: "http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map",
			featureNS: "http://mapserver.gis.umn.edu/mapserver",
			featureType: "pv_potential",
			srsName: DSS.mapProjection
		})},
        {isBaseLayer: false,  
     	 visibility: false}
	);
	
	DSS.buildsMini = new OpenLayers.Layer.Vector("RO_building_footprints_mini", {
		strategies: [new OpenLayers.Strategy.Fixed()], 
		styleMap: DSS.style,
		projection: new OpenLayers.Projection(DSS.mapProjection),
		protocol: new OpenLayers.Protocol.WFS({
			version: "1.1.0",
			url: "http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map",
			featureNS: "http://mapserver.gis.umn.edu/mapserver",
			featureType: "RO_building_footprints_mini",
			srsName: DSS.mapProjection
		})},
        {isBaseLayer: false,  
     	 visibility: false}
	);

	DSS.map.addLayers([streets, buildsWMS, /*DSS.buildsWFS,*/ potential, DSS.buildsMini]);
	
	DSS.map.zoomIn();
	DSS.map.zoomIn();
};

DSS.addNewWFS = function(name, address, style)
{
	if (style == null) style = DSS.style;
	
	var wfs = new OpenLayers.Layer.Vector(name + "_WFS", {
		strategies: [new OpenLayers.Strategy.Fixed()], 
		styleMap: style,
		projection: new OpenLayers.Projection(DSS.mapProjection)},
        {isBaseLayer: false,  
     	 visibility: false}
	);
	
	DSS.protocol = new OpenLayers.Protocol.WFS({
		version: "1.1.0",
		url: address,
		featureNS: "http://mapserver.gis.umn.edu/mapserver",
		featureType: name,
		srsName: DSS.mapProjection
	});
	
	var response = DSS.protocol.read({
	    maxFeatures: 100,
	    callback: DSS.featuresLoaded
	});

	return wfs;
};
