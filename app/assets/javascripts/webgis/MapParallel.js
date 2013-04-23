/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 22-04-2013
 *
 * Includes the functions to operationalise the parallel maps.
 **/

var WebGIS = WebGIS || { };

WebGIS.chSize = new OpenLayers.Size(17,17);
WebGIS.chOffset = new OpenLayers.Pixel(-(WebGIS.chSize.w/2), -(WebGIS.chSize.h/2));
WebGIS.chIcon = new OpenLayers.Icon('images/crosshairSimple.png', WebGIS.chSize, WebGIS.chOffset);

WebGIS.rightMarkers = new OpenLayers.Layer.Markers( "Markers" );
WebGIS.leftMarkers = new OpenLayers.Layer.Markers( "Markers" );
WebGIS.rightPointer;
WebGIS.leftPointer;
    

WebGIS.leftMapMove = function()
{
	rightMap.setCenter(WebGIS.leftMap.getCenter(), WebGIS.leftMap.getZoom());
}

WebGIS.leftMapMouseOver = function(e)
{
	WebGIS.rightPointer = new OpenLayers.Marker(WebGIS.leftMap.getLonLatFromPixel(e.xy), WebGIS.chIcon);
	rightMarkers.addMarker(WebGIS.rightPointer);
}

WebGIS.leftMapMouseOut = function()
{
	WebGIS.rightMarkers.clearMarkers();
}

WebGIS.leftMapMouseMove = function(e)
{
	WebGIS.rightMarkers.clearMarkers();
	WebGIS.rightPointer = new OpenLayers.Marker(WebGIS.leftMap.getLonLatFromPixel(e.xy), WebGIS.chIcon);
	WebGIS.rightMarkers.addMarker(WebGIS.rightPointer);
}

WebGIS.rightMapMouseOver = function(e)
{
	WebGIS.leftPointer = new OpenLayers.Marker(WebGIS.rightMap.getLonLatFromPixel(e.xy), WebGIS.chIcon);
	WebGIS.leftMarkers.addMarker(WebGIS.leftPointer);
}

WebGIS.rightMapMouseOut = function()
{
	WebGIS.leftMarkers.clearMarkers();
}

rightMapMouseMove = function(e)
{
	WebGIS.leftMarkers.clearMarkers();
	WebGIS.leftPointer = new OpenLayers.Marker(WebGIS.rightMap.getLonLatFromPixel(e.xy), WebGIS.chIcon);
	WebGIS.leftMarkers.addMarker(WebGIS.leftPointer);
}

WebGIS.rightMapMove = function()
{
	WebGIS.leftMap.setCenter(WebGIS.rightMap.getCenter(), WebGIS.rightMap.getZoom());
}

WebGIS.initMapOSM = function() 
{	
	WebGIS.leftMap = new OpenLayers.Map(); 
	WebGIS.leftMap.addLayer(new OpenLayers.Layer.OSM());
	WebGIS.leftMap.addControl(new OpenLayers.Control.MousePosition());
	WebGIS.leftMap.setCenter(new OpenLayers.LonLat(-233307, 7790000), 11);
	
	WebGIS.leftMap.addLayer(leftMarkers);
	
	WebGIS.leftMap.events.register("moveend", 	null, WebGIS.leftMapMove);
	WebGIS.leftMap.events.register("mousemove", null, WebGIS.leftMapMouseMove);
	WebGIS.leftMap.events.register("mouseout",  null, WebGIS.leftMapMouseOut);
	WebGIS.leftMap.events.register("mouseover", null, WebGIS.leftMapMouseOver);
	
	WebGIS.rightMap = new OpenLayers.Map(); 
	WebGIS.rightMap.addLayer(new OpenLayers.Layer.OSM());
	WebGIS.rightMap.addControl(new OpenLayers.Control.MousePosition());
	WebGIS.rightMap.setCenter(new OpenLayers.LonLat(-233307, 7790000), 11);
	
	WebGIS.rightMap.addLayer(WebGIS.rightMarkers);
	
	WebGIS.rightMap.events.register("moveend", 	 null, WebGIS.rightMapMove);
	WebGIS.rightMap.events.register("mousemove", null, WebGIS.rightMapMouseMove);
	WebGIS.rightMap.events.register("mouseout",  null, WebGIS.rightMapMouseOut);
	WebGIS.rightMap.events.register("mouseover", null, WebGIS.rightMapMouseOver);

};