/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 22-04-2013
 *
 * Includes the functions to operationalise the parallel maps.
 **/

var WebGIS = WebGIS || { };

var WebGIS.chSize = new OpenLayers.Size(17,17);
var WebGIS.chOffset = new OpenLayers.Pixel(-(WebGIS.chSize.w/2), -(WebGIS.chSize.h/2));
var WebGIS.chIcon = new OpenLayers.Icon('images/crosshairSimple.png', WebGIS.chSize, WebGIS.chOffset);

var WebGIS.rightMarkers = new OpenLayers.Layer.Markers( "Markers" );
var WebGIS.leftMarkers = new OpenLayers.Layer.Markers( "Markers" );
var WebGIS.rightPointer;
var WebGIS.leftPointer;
    

function WebGIS.leftMapMove()
{
	rightMap.setCenter(WebGIS.leftMap.getCenter(), WebGIS.leftMap.getZoom());
}

function WebGIS.leftMapMouseOver(e)
{
	WebGIS.rightPointer = new OpenLayers.Marker(WebGIS.leftMap.getLonLatFromPixel(e.xy), WebGIS.chIcon);
	rightMarkers.addMarker(WebGIS.rightPointer);
}

function WebGIS.leftMapMouseOut()
{
	WebGIS.rightMarkers.clearMarkers();
}

function WebGIS.leftMapMouseMove(e)
{
	WebGIS.rightMarkers.clearMarkers();
	WebGIS.rightPointer = new OpenLayers.Marker(WebGIS.leftMap.getLonLatFromPixel(e.xy), WebGIS.chIcon);
	WebGIS.rightMarkers.addMarker(WebGIS.rightPointer);
}

function WebGIS.rightMapMouseOver(e)
{
	WebGIS.leftPointer = new OpenLayers.Marker(WebGIS.rightMap.getLonLatFromPixel(e.xy), WebGIS.chIcon);
	WebGIS.leftMarkers.addMarker(WebGIS.leftPointer);
}

function WebGIS.rightMapMouseOut()
{
	WebGIS.leftMarkers.clearMarkers();
}

function rightMapMouseMove(e)
{
	WebGIS.leftMarkers.clearMarkers();
	WebGIS.leftPointer = new OpenLayers.Marker(WebGIS.rightMap.getLonLatFromPixel(e.xy), WebGIS.chIcon);
	WebGIS.leftMarkers.addMarker(WebGIS.leftPointer);
}

function WebGIS.rightMapMove()
{
	WebGIS.leftMap.setCenter(WebGIS.rightMap.getCenter(), WebGIS.rightMap.getZoom());
}

function initMapOSM() {
	
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