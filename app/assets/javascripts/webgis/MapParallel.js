/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 22-04-2013
 *
 * Includes the functions to operationalise the parallel maps.
 **/

var WebGIS = WebGIS || { };


var crosshairs = '/assets/crosshairYellowTransparent.png';


WebGIS.leftMapMove = function()
{
	WebGIS.rightMap.setCenter(WebGIS.leftMap.getCenter(), WebGIS.leftMap.getZoom());
}

WebGIS.leftMapMouseOver = function(e)
{
	WebGIS.rightPointer = new OpenLayers.Marker(WebGIS.leftMap.getLonLatFromPixel(e.xy), WebGIS.chIconRight);
	WebGIS.rightMarkers.addMarker(WebGIS.rightPointer);
}

WebGIS.leftMapMouseOut = function()
{
	WebGIS.rightMarkers.clearMarkers();
}

WebGIS.leftMapMouseMove = function(e)
{
	var lonLat = WebGIS.leftMap.getLonLatFromPixel(e.xy);
	
	WebGIS.rightMarkers.clearMarkers();
	WebGIS.rightPointer = new OpenLayers.Marker(lonLat, WebGIS.chIconRight);
	WebGIS.rightMarkers.addMarker(WebGIS.rightPointer);
	WebGIS.rightMarkers.graphicZIndex = WebGIS.MARKER_Z_INDEX;
	
	WebGIS.updateCoords(lonLat);
}

WebGIS.rightMapMouseOver = function(e)
{
	// Markers must be re-added to the leftMap, otherwise the pointer won't show up
	WebGIS.leftMap.addLayer(WebGIS.leftMarkers);
	WebGIS.leftPointer = new OpenLayers.Marker(WebGIS.rightMap.getLonLatFromPixel(e.xy), WebGIS.chIconLeft);
	WebGIS.leftMarkers.addMarker(WebGIS.leftPointer);
}

WebGIS.rightMapMouseOut = function()
{
	WebGIS.leftMarkers.clearMarkers();
}

WebGIS.rightMapMouseMove = function(e)
{
	var lonLat = WebGIS.leftMap.getLonLatFromPixel(e.xy);
	
	WebGIS.leftMarkers.clearMarkers();
	WebGIS.leftPointer = new OpenLayers.Marker(lonLat, WebGIS.chIconLeft);
	WebGIS.leftMarkers.addMarker(WebGIS.leftPointer);
	WebGIS.leftMarkers.graphicZIndex = WebGIS.MARKER_Z_INDEX;
	
	WebGIS.updateCoords(lonLat);
}

WebGIS.rightMapMove = function()
{
	WebGIS.leftMap.setCenter(WebGIS.rightMap.getCenter(), WebGIS.rightMap.getZoom());
}

WebGIS.initParallelEvents = function() 
{	
	WebGIS.MARKER_Z_INDEX = 1000;
	
	WebGIS.chSize = new OpenLayers.Size(17,17);
	WebGIS.chOffsetRight = new OpenLayers.Pixel(-(WebGIS.chSize.w/2) - 0, -(WebGIS.chSize.h/2) - 1);
	WebGIS.chOffsetLeft  = new OpenLayers.Pixel(-(WebGIS.chSize.w/2) - 2, -(WebGIS.chSize.h/2) - 0);
	WebGIS.chIconRight = new OpenLayers.Icon(crosshairs, WebGIS.chSize, WebGIS.chOffsetRight);
	WebGIS.chIconLeft  = new OpenLayers.Icon(crosshairs, WebGIS.chSize, WebGIS.chOffsetLeft);

	WebGIS.rightMarkers = new OpenLayers.Layer.Markers( "Markers" );
	WebGIS.leftMarkers = new OpenLayers.Layer.Markers( "Markers" );

	WebGIS.leftMarkers.displayInLayerSwitcher = false;
	WebGIS.leftMap.addLayer(WebGIS.leftMarkers);
	WebGIS.leftMarkers.graphicZIndex = WebGIS.MARKER_Z_INDEX;
	
	WebGIS.leftMap.events.register("moveend", 	null, WebGIS.leftMapMove);
	WebGIS.leftMap.events.register("mousemove", null, WebGIS.leftMapMouseMove);
	WebGIS.leftMap.events.register("mouseout",  null, WebGIS.leftMapMouseOut);
	WebGIS.leftMap.events.register("mouseover", null, WebGIS.leftMapMouseOver);
	
	WebGIS.rightMarkers.displayInLayerSwitcher = false;
	WebGIS.rightMap.addLayer(WebGIS.rightMarkers);
	WebGIS.rightMarkers.graphicZIndex = WebGIS.MARKER_Z_INDEX;
	
	WebGIS.rightMap.events.register("moveend", 	 null, WebGIS.rightMapMove);
	WebGIS.rightMap.events.register("mousemove", null, WebGIS.rightMapMouseMove);
	WebGIS.rightMap.events.register("mouseout",  null, WebGIS.rightMapMouseOut);
	WebGIS.rightMap.events.register("mouseover", null, WebGIS.rightMapMouseOver);
};