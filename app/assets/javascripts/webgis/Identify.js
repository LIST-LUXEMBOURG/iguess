/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 12-11-2012
 *
 * Includes the functions to perform the identify action
 **/

var WebGIS = WebGIS || { };

WebGIS.ctrlIdentify = null;

// window dialog
WebGIS.treeConfigWin = new Ext.Window({
    layout: "fit",
    hideBorders: true,
    closeAction: "hide",
    width: 300,
    height: 400,
    title: "Identify",
    items: [{
        xtype: "form",
        layout: "fit",
        items: [{
            id: "textarea",
            xtype: "textarea"
         }],
        buttons: [ {
            text: "Close",
            handler: function() {
            	WebGIS.treeConfigWin.hide();
            }
        }]
    }]
});

WebGIS.addIdentifyControl = function (map) {

	WebGIS.ctrlIdentify = new OpenLayers.Control.WMSGetFeatureInfo({
      url: 'http://weastflows.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/Weastflows.map&', 
      title: 'Identify features by clicking',
      //layers: [roads],
      queryVisible: true
   });

   //map.events.register("getfeatureinfo", this, WebGIS.showInfo);
   map.events.register("getfeatureinfo", WebGIS, WebGIS.showInfo);
   //WebGIS.ctrlIdentify.activate();
}

WebGIS.toggleIdentify = function () {
	
	/*alert("Control title: \n" + WebGIS.ctrlIdentify.title + "\n" +
		  "Active: " + WebGIS.ctrlIdentify.active);*/
   
   Ext.getCmp("textarea").setValue(
		"This control is stil in development \n\n" + 
		"Control title: " + WebGIS.ctrlIdentify.title + "\n" +
		"Active: " + WebGIS.ctrlIdentify.active);
   WebGIS.treeConfigWin.show();
}

WebGIS.showInfo = function (evt) {
   alert('Id');
    if (evt.features && evt.features.length) {
         highlightLayer.destroyFeatures();
         highlightLayer.addFeatures(evt.features);
         highlightLayer.redraw();
    } else {
        //document.getElementById('responseText').innerHTML = evt.text;
    	WebGIS.treeConfigWin.show();
        Ext.getCmp("Identify").setValue(evt.text);
    }
}

