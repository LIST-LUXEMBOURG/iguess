/**
 * Copyright (C) 2010 - 2014 CRP Henri Tudor
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
 * Date: 13-05-2013
 *
 * Methods to control the sliders window.
 */ 

var DSS = DSS || { };

DSS.lock = false;

DSS.costField = "multi_c_e";
DSS.invField = "mult_r_i";
DSS.areaField = "area_cum";
DSS.genField = "mult_r_e";

DSS.potSlider = null;
DSS.capSlider = null; 
DSS.invSlider = null;

DSS.comboLayer = null;
DSS.comboInvest = null;

DSS.winSelect = null;

DSS.nextSelect = null;

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
		
};

DSS.calcCostValue = function(percent)
{
	costPercent = percent * (DSS.costSlider.maxValue - DSS.costSlider.minValue) / 100;
	return DSS.costSlider.minValue + costPercent;
};

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
};

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
		DSS.rule_highlight.filter.property = DSS.costField;
		DSS.buildsWFS.redraw();
		DSS.lock = false;
	}
};

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
		DSS.rule_highlight.filter.property = DSS.invField;
		DSS.buildsWFS.redraw();
		DSS.lock = false;
	}
};

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
		DSS.rule_highlight.filter.property = DSS.areaField;
		DSS.buildsWFS.redraw();
		DSS.lock = false;
	}
};

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
		DSS.rule_highlight.filter.property = DSS.genField;
		DSS.buildsWFS.redraw();
		DSS.lock = false;
	}
};

DSS.showWindow = function() {
	
	DSS.winPanel.show();
	
};

DSS.getOverlays = function()
{
	overlays = new Array(); 
	
	for(i=0; i < DSS.map.layers.length; i++)
		if (!DSS.map.layers[i].isBaseLayer)
			overlays.push(DSS.map.layers[i].name);
	
	return overlays;
};

DSS.comboLayerSelected = function()
{
	layers = DSS.map.getLayersByName(DSS.comboLayer.getValue());
	if(layers.length <= 0) return;
	
	var attributes = new Array();
	for (var key in layers[0].features[0].attributes) attributes.push(key);
	
	DSS.comboCost.enable();
	DSS.comboInvest.enable();
	DSS.comboGen.enable();
	DSS.comboArea.enable();
	
	DSS.comboCost.store = attributes;	
	DSS.comboInvest.store = attributes;
	DSS.comboGen.store = attributes;
	DSS.comboArea.store = attributes;
};

DSS.comboFieldsSelected = function()
{
	if((DSS.comboInvest.getValue() != null) && (DSS.comboInvest.getValue() != "") &&
	   (DSS.comboGen.getValue()    != null) && (DSS.comboGen.getValue()    != "") &&
       (DSS.comboArea.getValue()   != null) && (DSS.comboArea.getValue()   != "") &&
       (DSS.comboCost.getValue()   != null) && (DSS.comboCost.getValue()   != ""))
		DSS.nextSelect.enable();
};

DSS.next = function()
{
	alert("Next!");
};

DSS.quit = function()
{
	DSS.winPanel.close();
	DSS.winSelect.close();
};

DSS.showTestWindow = function() 
{
	DSS.comboLayer  = new Ext.form.ComboBox(
	{
		fieldLabel: 'Layer', 
		store: DSS.getOverlays(), 
	    listeners:{
	         scope: DSS,
	         'select': DSS.comboLayerSelected
	    }
	});
	
	DSS.comboCost = new Ext.form.ComboBox(
			{	
				fieldLabel: 'Cost', 	
				store: [''], 
				disabled: true, 
			    listeners:{
			         scope: DSS,
			         'select': DSS.comboFieldsSelected
			    }
			});
	
	DSS.comboInvest = new Ext.form.ComboBox(
	{	
		fieldLabel: 'Investment', 	
		store: [''], 
		disabled: true, 
	    listeners:{
	         scope: DSS,
	         'select': DSS.comboFieldsSelected
	    }
	});
	
	DSS.comboGen = new Ext.form.ComboBox(
	{
		fieldLabel: 'Generation', 	
		store: [''], 
		disabled: true, 
	    listeners:{
	         scope: DSS,
	         'select': DSS.comboFieldsSelected
	    }
	});
	
	DSS.comboArea = new Ext.form.ComboBox(
	{
		fieldLabel: 'Area', 
		store: [''], 
		disabled: true, 
	    listeners:{
	         scope: DSS,
	         'select': DSS.comboFieldsSelected
	    }
	});
	
	var info = new Ext.form.TextArea({disabled: true, originalValue: 'This is some info.'});
	
	//creating a form 
	this.form= new Ext.FormPanel({ 
		border:false, // <-- removing the border of the form
		defaults:{xtype:'textfield'},	//component by default of the form
		bodyStyle:'background-color:#e8e8e8;',
		items:[ 
		    DSS.comboLayer, 
		    DSS.comboCost, 
		    DSS.comboInvest, 
		    DSS.comboGen, 
		    DSS.comboArea, 
		    //info,
		] 
	}); 
	
	var intro = new Ext.Panel({
		bodyStyle:'background-color:#e8e8e8;',
		contentEl: 'divSelectId',
		border: false
	});
	
	DSS.nextSelect = new Ext.Button({
		text:'Next', 
        disabled: true,
        listeners:{
	    	scope: DSS,
	    	'click': DSS.next
	    }
    });

	//creating the window that will contain the form
	DSS.winSelect = new Ext.Window({ 
		title: 'Potential Application', 
		width:334, 
		height:310, 
		bodyStyle:'background-color:#e8e8e8;padding: 10px', 
		items:[intro, this.form], //assigning the form
		buttonAlign: 'right', //buttons aligned to the right
		buttons:
		[{
			text:'Cancel', 
		    listeners:{
		    	scope: DSS,
		    	'click': DSS.quit
		    }
		},
		DSS.nextSelect] //buttons of the form
	}); 

	DSS.winSelect.show();
	
	
	
};