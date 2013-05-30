/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 12-11-2012
 *
 * Includes the functions to perform the identify action
 **/

var WebGIS = WebGIS || { };

WebGIS.ctrlIdentify = null;

WebGIS.registerIdentify = function(map, ref) {

	WebGIS.ctrlIdentify = new OpenLayers.Control.WMSGetFeatureInfo({
		drillDown:true,
		infoFormat:"application/vnd.ogc.gml"
	});

	WebGIS.ctrlIdentify.events.register("getfeatureinfo", ref, WebGIS.showInfo);
	WebGIS.leftMap.addControl(WebGIS.ctrlIdentify);
};

WebGIS.toggleLayer = function(evt) 
{
	WebGIS.ctrlIdentify.layers = [];
	
	var layers  = WebGIS.leftMap.layers;                              
    
    for (var i = 0; i < layers.length; i++) 
    {
    	if (layers[i].getVisibility())
    		WebGIS.ctrlIdentify.layers.push(layers[i]);
    }
};

WebGIS.showInfo = function(evt) {
	
	var items = [];
    Ext.each(evt.features, function(feature) {
        items.push({
            xtype: "propertygrid",
            title: feature.fid,
            source: feature.attributes
        });
    });

    new GeoExt.Popup({
        title: "Feature Info",
        width: 300,
        height: 450,
        layout: "accordion",
        map: WebGIS.leftPanel,
		location: evt.xy,
        items: items
    }).show();
};
