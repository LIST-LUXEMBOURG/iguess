/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 12-11-2012
 *
 * Includes the functions to perform the identify action
 **/

var WebGIS = WebGIS || { };

WebGIS.ctrlIdentify = null;

WebGIS.closeButton = 
	"<br><br><br><br><input type=\"button\" value=\"Close\" align=\"left\" valign=\"bottom\" " + 
	"onClick=\"WebGIS.winIdentify.hide();\"/><br/>";

// window dialog
WebGIS.winIdentify = new Ext.Window({
    layout: "fit",
    hideBorders: true,
    closeAction: "hide",
    width: 300,
    height: 400,
    title: "Identify",
    contentEl: "winDivIdentify"
});

WebGIS.initWinIdentify = function() {
	
	var div = document.createElement('div');
	div.setAttribute('id', 'winDivIdentify');
};

WebGIS.registerIdentify = function(map, ref) {

	WebGIS.ctrlIdentify = new OpenLayers.Control.WMSGetFeatureInfo({
		url: 'http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map&', 
		title: 'Identify features by clicking',
		layers: [],
		queryVisible: true
	});

	WebGIS.ctrlIdentify.events.register("getfeatureinfo", ref, WebGIS.showInfo);
	WebGIS.map.addControl(WebGIS.ctrlIdentify);
};

WebGIS.treeClickListener = function(node,event) {
	
	WebGIS.ctrlIdentify.layers = [node.layer];
};

WebGIS.toggleIdentify = function() {

	var node = WebGIS.layerTree.getSelectionModel().getSelectedNode();

	if(node == null)
	{
    	Ext.MessageBox.show({
            title: 'Selected Nodes',
            msg: '<br>To use this function please select a layer in the tree.<br>',
            icon: Ext.MessageBox.INFO
        });
		return
	}

	WebGIS.ctrlIdentify.layers = [node.layer];
};

WebGIS.showInfo = function(evt) {

    if (evt.features && evt.features.length) {
         highlightLayer.destroyFeatures();
         highlightLayer.addFeatures(evt.features);
         highlightLayer.redraw();
    } else {
        document.getElementById('winDivIdentify').innerHTML = evt.text + WebGIS.closeButton;
		WebGIS.winIdentify.show();
    }
};

