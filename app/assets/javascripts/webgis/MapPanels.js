/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 06-01-2012
 *
 * Adds GeoExt controls and panels to map.
 */ 

//= require webgis/Identify

var WebGIS = WebGIS || { };

Ext.onReady(function() {

  Ext.state.Manager.setProvider(new Ext.state.CookieProvider());

  WebGIS.initMap();

  var zoomSlider = new GeoExt.ZoomSlider({
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

  var dataPanel = new Ext.Panel({
    title: 'Datasets',
    region:'west',
    collapsible: true,
    width: 182,
    contentEl: 'data'
  });

  var mapPanel = new GeoExt.MapPanel({
    region: "center",
    collapsible: false,
    floatable: false,
    xtype: "gx_mappanel",
    map: WebGIS.map,
    tbar: WebGIS.createTbarItems(WebGIS.map),
    items: [zoomSlider]
  });

  var LayerNodeUI = Ext.extend(
          GeoExt.tree.LayerNodeUI,
          new GeoExt.tree.TreeNodeUIEventMixin()
  );

  var treeConfig = [{
    nodeType: "gx_baselayercontainer",
    expanded: true
  }, {
    nodeType: "gx_overlaylayercontainer",
    expanded: true
  }];

  var layerTree = new Ext.tree.TreePanel({
    region: "east",
    title: 'Map Layers',
    width: 170,
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
    rootVisible: false
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
    items: [mapPanel, layerTree, dataPanel]
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
    control: new OpenLayers.Control.ZoomToMaxExtent()
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
  actions.push(new GeoExt.Action({
    iconCls: "identify",
    map: map,
    pressed: false,
    toggleGroup: "tools",
    allowDepress: false,
    tooltip: "Identify - still in development",
    //disabled: true
    control: WebGIS.ctrlIdentify,
    handler: WebGIS.toggleIdentify
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
