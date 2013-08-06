/**
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 13-05-2013
 *
 * Methods to control the sliders window.
 */ 

var DSS = DSS || { };

DSS.lock = false;

DSS.potSlider = null;
DSS.capSlider = null; 
DSS.invSlider = null;

DSS.winPanel = new Ext.Window({
	title: 'Potential Application', //Title of the Window 
	id: 'panelWindowId', //ID of the Window Panel
	autoHeight: true, //Height of the Window will be auto
	width:300, //Width of the Window
	resizable: false, //Resize of the Window, if false - it cannot be resized
	closable: false, //Hide close button of the Window
	modal: false, //When modal:true it make the window modal and mask everything behind it when displayed
	contentEl: 'divWindowId' //ID of the respective 'div'
	});



DSS.initSliders = function()
{
    DSS.costSlider = new Ext.Slider({
        renderTo: 'slider-cost',
        width: 214,
        value: 0,
        minValue: 90,
        maxValue: 200,
        plugins: new Ext.ux.SliderTip()
    });
    
    DSS.invSlider = new Ext.Slider({
        renderTo: 'slider-investment',
        width: 214,
        value: 0,
        minValue: 0,
        maxValue: 45600,
        plugins: new Ext.ux.SliderTip()
    });
    
    DSS.genSlider = new Ext.Slider({
        renderTo: 'slider-generation',
        width: 214,
        value: 0,
        minValue: 0,
        maxValue: 17000,
        plugins: new Ext.ux.SliderTip()
    });
    
    DSS.areaSlider = new Ext.Slider({
        renderTo: 'slider-area',
        width: 214,
        value: 0,
        minValue: 0,
        maxValue: 166000,
        plugins: new Ext.ux.SliderTip()
    });
    
	DSS.costSlider.on('change', DSS.costDragged, this);
	DSS.invSlider.on ('change', DSS.invDragged, this);
	DSS.genSlider.on ('change', DSS.genDragged, this);
	DSS.areaSlider.on('change', DSS.areaDragged, this);
		
}

DSS.calcCostValue = function(percent)
{
	costPercent = percent * (DSS.costSlider.maxValue - DSS.costSlider.minValue) / 100;
	return DSS.costSlider.minValue + costPercent;
}

DSS.updateLabels = function(percent)
{
	cost =   (DSS.calcCostValue(percent) / 1000).toFixed(3);
	invest = (percent * DSS.invSlider.maxValue  / 100).toFixed(0);
	gen =    (percent * DSS.genSlider.maxValue  / 100).toFixed(0);
	area =   (percent * DSS.areaSlider.maxValue / 100).toFixed(0);
	
	document.getElementById("cost").innerHTML   = "Cost: "  	 + cost + " &euro;/kWh";
	document.getElementById("invest").innerHTML = "Investment: " + invest + " k&euro;";
	document.getElementById("gen").innerHTML    = "Generation: " + gen + " MWh/a";
	document.getElementById("area").innerHTML   = "Area: "   	 + area + " m2";
}

DSS.costDragged = function(ed, value, oldValue) 
{	
	if(!DSS.lock)
	{
		DSS.lock = true;
		
		percent = (parseFloat(value) - DSS.costSlider.minValue) / (DSS.costSlider.maxValue - DSS.costSlider.minValue) * 100;
		DSS.updateLabels(percent);
		
		DSS.invSlider.setValue(percent * DSS.invSlider.maxValue / 100);
		DSS.genSlider.setValue(percent * DSS.genSlider.maxValue / 100);
		DSS.areaSlider.setValue(percent * DSS.areaSlider.maxValue / 100);
		
		
		DSS.rule_highlight.filter.value = value / 1000;
		DSS.rule_highlight.filter.property = "multi_c_e";
		DSS.buildsWFS.redraw();
		DSS.lock = false;
	}
}

DSS.invDragged = function(ed, value, oldValue) 
{	
	if(!DSS.lock)
	{
		DSS.lock = true;
		
		percent = parseFloat(value) / DSS.invSlider.maxValue * 100;
		DSS.updateLabels(percent);
		
		DSS.costSlider.setValue(DSS.calcCostValue(percent));
		DSS.genSlider.setValue(percent * DSS.genSlider.maxValue / 100);
		DSS.areaSlider.setValue(percent * DSS.areaSlider.maxValue / 100);
		
		DSS.rule_highlight.filter.value = value * 1000;
		DSS.rule_highlight.filter.property = "mult_r_i";
		DSS.buildsWFS.redraw();
		DSS.lock = false;
	}
}

DSS.areaDragged = function(ed, value, oldValue) 
{	
	if(!DSS.lock)
	{
		DSS.lock = true;
		
		percent = parseFloat(value) / DSS.areaSlider.maxValue * 100;
		DSS.updateLabels(percent);
		
		DSS.costSlider.setValue(DSS.calcCostValue(percent));
		DSS.invSlider.setValue(percent * DSS.invSlider.maxValue / 100);
		DSS.genSlider.setValue(percent * DSS.genSlider.maxValue / 100);
		
		DSS.rule_highlight.filter.value = value;
		DSS.rule_highlight.filter.property = "area_cum";
		DSS.buildsWFS.redraw();
		DSS.lock = false;
	}
}

DSS.genDragged = function(ed, value, oldValue) 
{	
	if(!DSS.lock)
	{
		DSS.lock = true;
		
		percent = parseFloat(value) / DSS.genSlider.maxValue * 100;
		DSS.updateLabels(percent);
		
		DSS.costSlider.setValue(DSS.calcCostValue(percent));
		DSS.invSlider.setValue(percent * DSS.invSlider.maxValue / 100);
		DSS.areaSlider.setValue(percent * DSS.areaSlider.maxValue / 100);
		
		
		DSS.rule_highlight.filter.value = value * 1000;
		DSS.rule_highlight.filter.property = "mult_r_e";
		DSS.buildsWFS.redraw();
		DSS.lock = false;
	}
}

DSS.showWindow = function() {
	
	DSS.winPanel.show();
	
}

DSS.showTestWindow = function() {
	
	DSS.winTest = new Ext.Window({
		title: 'Test window', //Title of the Window 
		id: 'testWindowId', //ID of the Window Panel
		//autoHeight: true, //Height of the Window will be auto
		height:100,
		width:300, //Width of the Window
		resizable: false, //Resize of the Window, if false - it cannot be resized
		closable: true, //Hide close button of the Window
		modal: false, //When modal:true it make the window modal and mask everything behind it when displayed
		//contentEl: 'divWindowId' //ID of the respective 'div'
		items: [
			    {
			        fieldLabel: 'ComboBox',
			        xtype: 'combo',
			        store: ['Foo', 'Bar']
			    }
			],
			buttons: [
			 	      {
			 	          text   :'Toggle Enabled',
			 	          handler: function() {
			 	              this.up('form').items.each(function(item) {
			 	                  item.setDisabled(!item.disabled);
			 	              });
			 	          }
			 	      },
			 	      {
			 	          text   : 'Reset Form',
			 	          /*handler: function() {
			 	              Ext.getCmp('form-widgets').getForm().reset();
			 	          }*/
			 	      },
			 	      {
			 	          text   : 'Validate',
			 	          /*handler: function() {
			 	              Ext.getCmp('form-widgets').getForm().isValid();
			 	          }*/
			 	      }
			 	  ]
			
	});

	/*DSS.winTest.items = [
	    {
	        fieldLabel: 'ComboBox',
	        xtype: 'combo',
	        store: ['Foo', 'Bar']
	    }
	]

	DSS.winTest.buttons = [
	      {
	          text   :'Toggle Enabled',
	          handler: function() {
	              this.up('form').items.each(function(item) {
	                  item.setDisabled(!item.disabled);
	              });
	          }
	      },
	      {
	          text   : 'Reset Form',
	          handler: function() {
	              Ext.getCmp('form-widgets').getForm().reset();
	          }
	      },
	      {
	          text   : 'Validate',
	          handler: function() {
	              Ext.getCmp('form-widgets').getForm().isValid();
	          }
	      }
	  ]*/
	
	DSS.winTest.show();
	
}