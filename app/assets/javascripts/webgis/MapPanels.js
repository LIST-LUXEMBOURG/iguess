/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 06-01-2012
 *
 * Adds GeoExt controls and panels to map.
 */ 

//= require webgis/Identify

var WebGIS = WebGIS || { };

WebGIS.layerTree;

Ext.onReady(function() {

  // Skip this stuff if the BroadMap div does not exist
  if($('#BroadMap').length == 0)
    return;

  Ext.state.Manager.setProvider(new Ext.state.CookieProvider());

  WebGIS.initMap();
  
  WebGIS.initWinIdentify();

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
	listeners: {
        click: {
            fn:WebGIS.treeClickListener
        }
    }
  });
  
  WebGIS.legend = new Ext.Panel({ 
		title: "Legend",
		xtype: "gx_legendpanel",
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
		items: [WebGIS.layerTree, WebGIS.legend]
  });
  
  var centralPanel = new Ext.Panel({
		layout:'border',
		bodyBorder: true,
		region:'center',
		width: 500,
		collapsible: false,
		items: [leftPanel, rightPanel]
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
});

/**
 * Method: createTbarItems
 * Create map toolbar items
 *
 * Returns:
 * {Array({GeoExt.Action})} An array of GeoExt.Action objects.
 */
WebGIS.createTbarItems = function(map) {
  var actions = [];
  actions.push(new GeoExt.Action({
    iconCls: "pan",
    map: map,
    pressed: true,
    toggleGroup: "tools",
    allowDepress: false,
    tooltip: "Navigate",
    control: new OpenLayers.Control.Navigation()
  }));
  actions.push(new GeoExt.Action({
    iconCls: "maxExtent",
    map: map,
    tooltip: "Zoom to max extent",
    handler: WebGIS.zoomToCity
  }));
  actions.push(new GeoExt.Action({
    iconCls: "zoomin",
    map: map,
    toggleGroup: "tools",
    allowDepress: false,
    tooltip: "Zoom in",
    control: new OpenLayers.Control.ZoomBox({
      out: false
    })
  }));
  actions.push(new GeoExt.Action({
    iconCls: "zoomout",
    map: map,
    toggleGroup: "tools",
    allowDepress: false,
    tooltip: "Zoom out",
    control: new OpenLayers.Control.ZoomBox({
      out: true
    })
  }));
  var ctrl = new OpenLayers.Control.NavigationHistory();
  map.addControl(ctrl);
  actions.push(new GeoExt.Action({
    control: ctrl.previous,
    iconCls: "back",
    tooltip: "back",
    disabled: true
  }));
  actions.push(new GeoExt.Action({
    control: ctrl.next,
    iconCls: "next",
    tooltip: "next",
    disabled: true
  }));
  actions.push("-");
  actions.push(new GeoExt.Action({
	    iconCls: "identify",
	    map: map,
	    pressed: false,
	    toggleGroup: "tools",
	    allowDepress: false,
	    tooltip: "Identify",
	    //disabled: true
	    control: WebGIS.ctrlIdentify,
	    handler: WebGIS.toggleIdentify
  }));
  actions.push(new GeoExt.Action({
    iconCls: "print",
    map: map,
    toggleGroup: "tools",
    allowDepress: false,
    tooltip: "Print - still in development",
    disabled: true
  }));
  return actions;
};
