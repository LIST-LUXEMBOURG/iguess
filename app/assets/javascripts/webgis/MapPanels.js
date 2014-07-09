/**
 *  Copyright (C) 2010 - 2014 CRP Henri Tudor
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * 
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 06-01-2012
 *
 * Adds GeoExt controls and panels to map.
 */ 

//= require webgis/MapInit
//= require webgis/Identify
//= require dss/Sliders

var WebGIS = WebGIS || { };

WebGIS.mainPanel = null;
WebGIS.leftPanel = null;
WebGIS.layerTree = null;

WebGIS.treeRoot = null;

WebGIS.headerHeight = 120;

WebGIS.coordsLatLabel = null;
WebGIS.coordsLongLabel = null;

WebGIS.filterBox = null;

WebGIS.showDSS = false;

WebGIS.createPanels = function() {

  // Skip this stuff if the BroadMap div does not exist
  // What the hell is this? It generates errors.
  /*if($('#BroadMap').length == 0)
    return;*/

  Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
  
  Ext.QuickTips.init();
  
  Ext.get('main_body').setStyle('margin', '0');
  
  var navHeight = 0;
  
  if(Ext.get('nav') != null)
  {
    Ext.get('nav').setStyle('margin-bottom', '0');
    navHeight = Ext.get("nav").getHeight();
  }
  
  WebGIS.headerHeight = navHeight + Ext.get("top_banner").getHeight();

  WebGIS.initMap();
  
  //---- Tool bars and widgets ----//
  
  var bBar = new Ext.Toolbar({
    region: "south",
    height: 24,
    border: 0,
    collapsible: false,
    floatable: false,
    autoScroll: false,
    enableDD: false,
    items: WebGIS.createBbar()
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

  WebGIS.leftPanel = new GeoExt.MapPanel({
    region: "center",
    collapsible: false,
    floatable: false,
    xtype: "gx_mappanel",
    map: WebGIS.leftMap,
    items: [leftZoomSlider],
    bbar: WebGIS.createBbar(),
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
               text: 'Google Streets',
               menu: [{
                 text: 'Google Streets',
                 checked: true,
                 handler  : WebGIS.baseGoogleSt,
                 group: 'baseLayer'
               },{
                 text: 'Google Satellite',
                 checked: false,
                 handler  : WebGIS.baseGoogleSat,
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
               },{
                 text: 'Open Street Map',
                 checked: false,
                 handler  : WebGIS.baseOSM,
                 group: 'baseLayer'
               },{
                 text: 'Country borders',
                 checked: false,
                 handler  : WebGIS.baseCountries,
                 group: 'baseLayer'
               }]
          }]
    }
  });
  
  //---- Layer catalogue ----//
   
  WebGIS.treeRoot = new Ext.tree.TreeNode({
      text        : '',
      id          : '0',
      leaf        : false,
      expandable  : true,
      expanded    : true
  });
  
  WebGIS.layerCatalogue = new Ext.tree.TreePanel({
  	id:"layerCat",
  	region: "south",
    width: "100%",
    //height: "700px",
    collapsible: true,
    autoScroll: true,
    enableDD: true,
    root: WebGIS.treeRoot,
    rootVisible: false,
    lines: false,
    viewConfig: {
    	style: { overflow: 'scroll'/*, height: "700px"*/}
  	},
  });
  
  WebGIS.cataloguePanel = new Ext.Panel({
  	title: 'Layers Catalogue',
	region: "south",
    collapsible: true,
    autoScroll: true,
    enableDD: true,
    items: [WebGIS.createFilter(), WebGIS.layerCatalogue]
  });
  
  //---- Layer display heap ----//
  
  var LayerNodeUI = Ext.extend(
          GeoExt.tree.LayerNodeUI,
          new GeoExt.tree.TreeNodeUIEventMixin()
  );

  var treeConfig = [{
    nodeType: "gx_overlaylayercontainer",
    text: "",
    iconCls: "emptyIcon",
    cls: "hiddenRoot",
    expanded: true,
    rootVisible: false
  }];

  WebGIS.layerTree = new Ext.tree.TreePanel({
    title: 'Map Layers',
    region: "North",
    //width: 200,
    collapsible: true,
    autoScroll: false,
    enableDD: false,
    draggable: false,
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
    lines: false
  });	
  
  //---- Main panels ----//
  
  WebGIS.westPanel = new Ext.Panel({
	region: "west",
	width: 250,
    collapsible: true,
    autoScroll: true,
    enableDD: true,
    items: [WebGIS.layerTree, WebGIS.cataloguePanel]
  });
  
  WebGIS.mainPanel = new Ext.Panel({
    layout:'border',
    bodyBorder: false,
    renderTo: "BroadMap",
    stateId: "BroadMap",
    //height: 790,
    height: Ext.getBody().getViewSize().height - WebGIS.headerHeight,
    width: '100%',
    //autoScroll:true, 
    defaults: {
      split: true,
      autoHide: false,
      useSplitTips: true,
    },
    items: [
            WebGIS.leftPanel,
            WebGIS.westPanel,
            //WebGIS.layerTree,
            { 
              // Legend: must be created here to be auto-linked to the map
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
            }
        ]
  });
  
  Ext.EventManager.onWindowResize(function () 
  {
    var width = 0, height = 0; 

    if(Ext.get('nav') != null)
      width = Ext.get("nav").getWidth();
    else 
      width = Ext.getBody().getViewSize().width;

    height = Ext.getBody().getViewSize().height - WebGIS.headerHeight;
    WebGIS.mainPanel.setSize(width, height);
  });
  
  WebGIS.layerTree.root.firstChild.hidden = true;
  WebGIS.layerTree.root.hidden = true;

  onLocationChanged(document.getElementById("city-dropdown").value);
  
  //Ext.getCmp('layerCat').el.dom.style.height = '700px';
  //Ext.getCmp('layerCat').el.dom.style.overflow = 'scroll';//'auto';//
  //Ext.getCmp('layerCat').el.dom.style.overflowX = 'hidden';
};


WebGIS.foldLayerCatalogue = function()
{
	nodes = WebGIS.layerCatalogue.root.childNodes;
	for (var i = 0; i < nodes.length; i++) 
		nodes[i].collapse();
};

/**
 * Method: showAllTreeNodes
 * Removes filtering from the layer tree by showing all nodes.
 */
WebGIS.showAllTreeNodes = function()
{
	nodes = WebGIS.layerTree.root.childNodes;
	for (var i = 0; i < nodes.length; i++) 
	{
		nodes[i].getUI().show();
		leafs = nodes[i].childNodes;
		for (var j = 0; j < leafs.length; j++) 
			leafs[j].getUI().show();
	}
};

/**
 * Method: handleFilter
 * Handles filtering to the layer catalogue.
 */
WebGIS.handleFilter = function()
{
	WebGIS.showAllTreeNodes();
	
	filter = WebGIS.filterBox.getValue();
	nodes = WebGIS.layerCatalogue.root.childNodes;
	
	if((filter == null) || (filter == ""))
	{ 
		for (var i = 0; i < nodes.length; i++) 
		{
			nodes[i].getUI().show();
			leafs = nodes[i].childNodes;
			for (var j = 0; j < leafs.length; j++) leafs[j].getUI().show();
		}
	}
	
	else
	{
		filter = filter.toUpperCase();
		
		for (var i = 0; i < nodes.length; i++) 
		{
			leafs = nodes[i].childNodes;
			show = false;
			for (var j = 0; j < leafs.length; j++) 
			{
				if((leafs[j].text !=null) && (leafs[j].text.toUpperCase().indexOf(filter,0) >= 0))		
				{	
					show = true;
					leafs[j].getUI().show();
				}
				else 
					leafs[j].getUI().hide();
					
			}
			if(show) nodes[i].getUI().show();
			else     nodes[i].getUI().hide();
		}
	}
};	

/**
 * Method: createFilter
 * Creates layer tree filter
 *
 * Returns:
 * {FormPanel({Ext.FormPanel})} An panel containing the filter text box.
 */
WebGIS.createFilter = function()
{
	WebGIS.filterBox = new Ext.form.TextField({ 
		fieldLabel:'', 
		name:'txt-name', 
		width: "100%",
		emptyText:'Filter layers...', 
		id:"id-filter",
		enableKeyEvents: true
	});
    
    WebGIS.filterBox.on('change', WebGIS.handleFilter);
    WebGIS.filterBox.on('keyup', WebGIS.handleFilter);
	
	form = new Ext.FormPanel({ 
		border:false, 
		bodyStyle:'background-color:#e8e8e8; padding:6px',
		region:'north',
		width: "100%",
		labelWidth: 1,
		height: 28,
		labelAlign: 'right',
		items:[WebGIS.filterBox] 
	});
	
	return form;
};

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
    tooltip: "<b>Navigate</b><br>Pan and zoom the map with the mouse.",
    control: new OpenLayers.Control.Navigation()
  }));
  actions.push(new GeoExt.Action({
    iconCls: "maxExtent",
    map: map,
    tooltip: "<b>Zoom to city extent</b>",
    handler: WebGIS.zoomToCity
  }));
  actions.push(new GeoExt.Action({
    iconCls: "zoomin",
    map: map,
    toggleGroup: "tools",
    allowDepress: false,
    tooltip: "<b>Zoom in</b>",
    control: new OpenLayers.Control.ZoomBox({
      out: false
    })
  }));
  actions.push(new GeoExt.Action({
    iconCls: "zoomout",
    map: map,
    toggleGroup: "tools",
    allowDepress: false,
    tooltip: "<b>Zoom out</b>",
    control: new OpenLayers.Control.ZoomBox({
      out: true
    })
  }));
  var ctrl = new OpenLayers.Control.NavigationHistory();
  map.addControl(ctrl);
  actions.push(new GeoExt.Action({
    control: ctrl.previous,
    iconCls: "back",
    tooltip: "<b>Back</b>",
    disabled: true
  }));
  actions.push(new GeoExt.Action({
    control: ctrl.next,
    iconCls: "next",
    tooltip: "<b>Next</b>",
    disabled: true
  }));
  actions.push("-");
  actions.push(new GeoExt.Action({
    iconCls: "identify",
    toggleGroup: "tools",
    tooltip: "<b>Identify</b><br>Click on a feature for details.",
    pressed: false,
    control: WebGIS.ctrlIdentify,
    map: map,
  }));
  actions.push(new GeoExt.Action({
    iconCls: "print",
    map: map,
    toggleGroup: "tools",
    allowDepress: false,
    tooltip: "<b>Print</b><br>Still in development",
    disabled: true
  }));
  
  if(isUserLoggedIn() && WebGIS.showDSS)
  {
    actions.push("-");
    actions.push(new Ext.Button({
      iconCls: "dss",
      handler: DSS.init,
      tooltip: "<b>Decision Support</b><br>Preview the application of an energy potential.",
     pressed: false
  	}));
  }
  return actions;
};

/**
 * Method: createBbar
 * Creates bottom bar
 *
 * Returns:
 * {Ext.Panel} An Ext panel with the bottom objects.
 */
WebGIS.createBbar = function() {
  
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
      },
      this
  );     
  
  WebGIS.leftMap.events.register('zoomend', this, function() 
  {
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
};
