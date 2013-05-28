/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 06-01-2012
 *
 * Adds GeoExt controls and panels to map.
 */ 

//= require webgis/Identify

var WebGIS = WebGIS || { };

WebGIS.CreatePanelsParallel = function() {

  // Skip this stuff if the BroadMap div does not exist
  if($('#BroadMap').length == 0)
    return;

  Ext.state.Manager.setProvider(new Ext.state.CookieProvider());

  WebGIS.initMapParallel();
  
  WebGIS.initWinIdentify();
  
  var bBar = new Ext.Toolbar({
	  region: "south",
	  height: 24,
	  border: 0,
	  collapsible: false,
	  floatable: false,
	  autoScroll: false,
	  enableDD: false,
	  items: WebGIS.createBbarParallel()
  });

  var leftZoomSlider = new GeoExt.ZoomSlider({
    xtype: "gx_zoomslider",
    aggressive: true,
    vertical: true,
    height: 100,
    x: 10,
    y: 20,
    plugins: new GeoExt.ZoomSliderTip({
      template: "Scale: 1 : {scale}<br>Resolution: {resolution}"
    })
  });
  
  var rightZoomSlider = new GeoExt.ZoomSlider({
    xtype: "gx_zoomslider",
    aggressive: true,
    vertical: true,
    height: 100,
    x: 10,
    y: 20,
    plugins: new GeoExt.ZoomSliderTip({
      template: "Scale: 1 : {scale}<br>Resolution: {resolution}"
    })
  });

  var leftPanel = new GeoExt.MapPanel({
    region: "center",
    collapsible: false,
    floatable: false,
    width: '50%',
    xtype: "gx_mappanel",
    map: WebGIS.leftMap,
    items: [leftZoomSlider],
    //bbar: WebGIS.createBbar(),
    tbar: {
        height: 100,
        items:[
            '-',
            WebGIS.createTbarItems(WebGIS.leftMap),
            '-',
            '->',
            '-',
           {
               xtype:'splitbutton',
               text: 'Open Street Map',
               menu: [{
            	   text: 'Open Street Map',
            	   checked: true,
            	   handler  : WebGIS.baseOSM,
            	   group: 'baseLayer'
               },{
            	   text: 'Google Satellite',
            	   checked: false,
            	   handler  : WebGIS.baseGoogleSat,
            	   group: 'baseLayer'
               },{
            	   text: 'Google Streets',
            	   checked: false,
            	   handler  : WebGIS.baseGoogleSt,
            	   group: 'baseLayer'
               },{
            	   text: 'Google Physical',
            	   checked: false,
            	   handler  : WebGIS.baseGooglePhy,
            	   group: 'baseLayer'
               },{
            	   text: 'Google Hybrid',
            	   checked: false,
            	   handler  : WebGIS.baseGoogleHy,
            	   group: 'baseLayer'
               }]
       		}]
    }
  });

  var rightPanel = new GeoExt.MapPanel({
		region:'east',
		collapsible: true,
		floatable: false,
	    autoScroll: true,
	    enableDD: true,
		width: '50%',
		xtype: "gx_mappanel",
		map: WebGIS.rightMap,
	    items: [rightZoomSlider]
  });

  var LayerNodeUI = Ext.extend(
          GeoExt.tree.LayerNodeUI,
          new GeoExt.tree.TreeNodeUIEventMixin()
  );

  var treeConfig = [{
    nodeType: "gx_overlaylayercontainer",
    expanded: true
  }];
  
  // Layer list
  WebGIS.layerTree = new Ext.tree.TreePanel({
    title: 'Map Layers',
    collapsible: true,
    autoScroll: true,
    enableDD: true,
    plugins: [{
      ptype: "gx_treenodecomponent"
    }],
    loader: {
      applyLoader: false,
      uiProviders: {
        "custom_ui": LayerNodeUI
      }
    },
    root: {
      children: treeConfig
    },
    rootVisible: false,
    lines: false,
	/*listeners: {
        click: {
            fn:WebGIS.treeClickListener
        }
    }*/
  });
  
  WebGIS.layerStore = new GeoExt.data.LayerStore({
	    map: WebGIS.leftMap,
	    layers: WebGIS.leftMap.layers
  });
  
  //WebGIS.legend = new Ext.Panel({ 
  WebGIS.legend = new GeoExt.LegendPanel({
		title: "Legend",
		xtype: "gx_legendpanel",
		layerStore: WebGIS.layerStore,
		collapsible: true,
		autoScroll: true,
		enableDD: true,
		padding: 5,
		rootVisible: false,
		lines: false
  });
  
  var accordeon = new Ext.Panel({
		title: 'Data',
		region:'west',   	
		collapsible: true,
		width: 270,
		layout: 'accordion',
		items: [WebGIS.layerTree, /*WebGIS.legend*/
		{ // Legend: must be created here to be auto-linked to the map
    		//region: "east",
    		title: "Legend",
    		xtype: "gx_legendpanel",
    		width: 150,
    		collapsible: true,
    		autoScroll: true,
    		enableDD: true,
    		padding: 5,
    		rootVisible: false,
    		lines: false
      }]
  });
  
  var centralPanel = new Ext.Panel({
		layout:'border',
		bodyBorder: true,
		region:'center',
		//width: 500,
		collapsible: false,
		defaults: {
	      split: true,
	      autoHide: false,
	      useSplitTips: true,
	    },
		items: [leftPanel, rightPanel, bBar]
  });
	
  
  var mainPanel = new Ext.Panel({
    layout:'border',
    bodyBorder: false,
    renderTo: "BroadMap",
    stateId: "BroadMap",
    height: 690,
    width: '100%',
    defaults: {
      split: true,
      autoHide: false,
      useSplitTips: true,
    },
    items: [
            //mapPanel,
            
            centralPanel,
            //WebGIS.layerTree,
            accordeon,
            
            /*{ // Legend: must be created here to be auto-linked to the map
        		region: "east",
        		title: "Legend",
        		xtype: "gx_legendpanel",
        		width: 150,
        		collapsible: true,
        		autoScroll: true,
        		enableDD: true,
        		padding: 5,
        		rootVisible: false,
        		lines: false
          }*/]
  });

  WebGIS.zoomToCity();
};

/**
 * Method: createBbar
 * Creates bottom bar
 *
 * Returns:
 * {Ext.Panel} An Ext panel with the bottom objects.
 */
WebGIS.createBbarParallel = function() {
	
	WebGIS.coordsLatLabel  = new Ext.form.Label({text: " "});
	WebGIS.coordsLongLabel = new Ext.form.Label({text: " "});
	
	var scaleLabel = new Ext.form.Label({text: "Scale:    "});

	var scaleStore = new GeoExt.data.ScaleStore({map: WebGIS.leftMap});
	
	var zoomSelector = new Ext.form.ComboBox({
	    store: scaleStore,
	    emptyText: "Zoom Level",
	    tpl: '<tpl for="."><div class="x-combo-list-item">1 : {[parseInt(values.scale)]}</div></tpl>',
	    editable: false,
	    width: 120,
	    //height: 66,
	    triggerAction: 'all', // needed so that the combo box doesn't filter by its current content
	    mode: 'local' // keep the combo box from forcing a lot of unneeded data refreshes
	});
	
	zoomSelector.on('select', 
	    function(combo, record, index) {
			WebGIS.leftMap.zoomTo(record.data.level);
			WebGIS.rightMap.zoomTo(record.data.level);
	    },
	    this
	);     
	
	WebGIS.leftMap.events.register('zoomend', this, function() {
	    var scale = scaleStore.queryBy(function(record){
	        return WebGIS.leftMap.getZoom() == record.data.level;
	    });
	
	    if (scale.length > 0) {
	        scale = scale.items[0];
	        zoomSelector.setValue("1 : " + parseInt(scale.data.scale));
	    } else {
	        if (!zoomSelector.rendered) return;
	        zoomSelector.clearValue();
	    }
	});
	
	return ['-', scaleLabel, zoomSelector, '-', '->', 
	         '-', WebGIS.coordsLongLabel, '-', WebGIS.coordsLatLabel, '-'];
}
