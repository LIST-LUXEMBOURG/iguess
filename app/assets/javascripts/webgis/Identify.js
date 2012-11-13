/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 12-11-2012
 *
 * Includes the functions to perform the identify action
 **/

var ctrlIdentify;

// window dialog
var treeConfigWin = new Ext.Window({
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
                treeConfigWin.hide();
            }
        }]
    }]
});

function addControls(map) {

   ctrlIdentify = new OpenLayers.Control.WMSGetFeatureInfo({
      url: 'http://weastflows.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/Weastflows.map&', 
      title: 'Identify features by clicking',
      //layers: [roads],
      queryVisible: true
   });

   map.events.register("getfeatureinfo", this, showInfo);
   ctrlIdentify.activate();

}



function toggleIdentify() {

   if(ctrlIdentify.active) ctrlIdentify.deactivate();
   else ctrlIdentify.activate();
   
   Ext.getCmp("textarea").setValue("Toggled");
   //treeConfigWin.setValue("Toggled");
   treeConfigWin.show();
}

function showInfo(evt) {
   alert('Id');
    if (evt.features && evt.features.length) {
         highlightLayer.destroyFeatures();
         highlightLayer.addFeatures(evt.features);
         highlightLayer.redraw();
    } else {
        //document.getElementById('responseText').innerHTML = evt.text;
      treeConfigWin.show();
        Ext.getCmp("Identify").setValue(evt.text);
    }
}

