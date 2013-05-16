/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 22-04-2013
 *
 * Includes the functions to operationalise the parallel maps.
 **/

var WebGIS = WebGIS || { };

WebGIS.chSize = new OpenLayers.Size(17,17);
WebGIS.chOffset = new OpenLayers.Pixel(-(WebGIS.chSize.w/2), -(WebGIS.chSize.h/2));
WebGIS.chIcon = new OpenLayers.Icon('/assets/crosshairSimple.png', WebGIS.chSize, WebGIS.chOffset);

WebGIS.rightMarkers = new OpenLayers.Layer.Markers( "Markers" );
WebGIS.leftMarkers = new OpenLayers.Layer.Markers( "Markers" );
WebGIS.rightPointer;
WebGIS.leftPointer;
    

WebGIS.leftMapMove = function()
{
	WebGIS.rightMap.setCenter(WebGIS.leftMap.getCenter(), WebGIS.leftMap.getZoom());
}

WebGIS.leftMapMouseOver = function(e)
{
	WebGIS.rightPointer = new OpenLayers.Marker(WebGIS.leftMap.getLonLatFromPixel(e.xy), WebGIS.chIcon);
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
	WebGIS.rightPointer = new OpenLayers.Marker(lonLat, WebGIS.chIcon);
	WebGIS.rightMarkers.addMarker(WebGIS.rightPointer);
	
	WebGIS.updateCoords(lonLat);
}

WebGIS.rightMapMouseOver = function(e)
{
	// Markers must be re-added to the leftMap, otherwise the pointer won't show up
	WebGIS.leftMap.addLayer(WebGIS.leftMarkers);
	WebGIS.leftPointer = new OpenLayers.Marker(WebGIS.rightMap.getLonLatFromPixel(e.xy), WebGIS.chIcon);
	WebGIS.leftMarkers.addMarker(WebGIS.leftPointer);
	WebGIS.coords.text = WebGIS.rightMap.getLonLatFromPixel(e.xy);
}

WebGIS.rightMapMouseOut = function()
{
	WebGIS.leftMarkers.clearMarkers();
}

WebGIS.rightMapMouseMove = function(e)
{
	var lonLat = WebGIS.leftMap.getLonLatFromPixel(e.xy);
	
	WebGIS.leftMarkers.clearMarkers();
	WebGIS.leftPointer = new OpenLayers.Marker(lonLat, WebGIS.chIcon);
	WebGIS.leftMarkers.addMarker(WebGIS.leftPointer);
	
	WebGIS.updateCoords(lonLat);
}

WebGIS.rightMapMove = function()
{
	WebGIS.leftMap.setCenter(WebGIS.rightMap.getCenter(), WebGIS.rightMap.getZoom());
}

WebGIS.initParallelEvents = function() 
{	
	WebGIS.leftMap.addLayer(WebGIS.leftMarkers);
	
	WebGIS.leftMap.events.register("moveend", 	null, WebGIS.leftMapMove);
	WebGIS.leftMap.events.register("mousemove", null, WebGIS.leftMapMouseMove);
	WebGIS.leftMap.events.register("mouseout",  null, WebGIS.leftMapMouseOut);
	WebGIS.leftMap.events.register("mouseover", null, WebGIS.leftMapMouseOver);
	
	WebGIS.rightMap.addLayer(WebGIS.rightMarkers);
	
	WebGIS.rightMap.events.register("moveend", 	 null, WebGIS.rightMapMove);
	WebGIS.rightMap.events.register("mousemove", null, WebGIS.rightMapMouseMove);
	WebGIS.rightMap.events.register("mouseout",  null, WebGIS.rightMapMouseOut);
	WebGIS.rightMap.events.register("mouseover", null, WebGIS.rightMapMouseOver);
};