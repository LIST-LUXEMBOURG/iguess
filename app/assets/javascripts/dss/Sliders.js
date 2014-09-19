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

//= require webgis/MapInit
//= require dss/Feature
//= require dss/FeatureArray
//= require dss/Map

var DSS = DSS || { };

DSS.lock = false;

DSS.potSlider = null;
DSS.capSlider = null; 
DSS.invSlider = null;

DSS.costFactor = 1000;
DSS.invFactor = 1000;
DSS.genFactor = 1000;

DSS.costEl = "cost";
DSS.invEl = "invest";
DSS.genEl = "gen";
DSS.areaEl = "area";

DSS.costLabel = "Cost: ";
DSS.costUnits = " &euro;/kWh";

DSS.invLabel = "Investment: ";
DSS.invUnits = " k&euro;";

DSS.genLabel = "Energy Generation/Savings: ";
DSS.genUnits = " MWh/a";

DSS.areaLabel = "Area: ";
DSS.areaUnits =  " m2";

DSS.controlWidth = 258;

DSS.featureArray = null;

DSS.style = null;
DSS.rule_fsa = null;
DSS.rule_highlight = null;

DSS.createStyle = function()
{
	//create a style object
	DSS.style = new OpenLayers.Style();
	//rule used for all polygons
	DSS.rule_fsa = new OpenLayers.Rule({
		symbolizer: {
			fillColor: "#DDDD00",
			fillOpacity: 0.6,
			strokeColor: "#DDDD00",
			strokeWidth: 1,
		}
	});
	
	DSS.rule_highlight = new OpenLayers.Rule({
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.LESS_THAN,
			property: "cum_multi",
			value: 0,
		}),
		symbolizer: {
			fillColor: "#00CC33",
			fillOpacity: 0.5,
			strokeColor: "#00CC33",
			strokeWidth: 2,
			strokeDashstyle: "solid",
		}
	});
	
	DSS.style.addRules([DSS.rule_fsa, DSS.rule_highlight]);
	
	return DSS.style;
};

DSS.showWindow = function() 
{	
	DSS.winPanel.show();	
};

DSS.quit = function()
{
	DSS.winPanel.hide();
	DSS.winSelect.hide();

	DSS.layerWFS.setVisibility(false);
	DSS.layerWFS.removeAllFeatures();
	
	if(DSS.costSlider != null)
	{
		DSS.costSlider.destroy();
		DSS.costSlider = null;
	} 
	if(DSS.invSlider  != null)
	{
		DSS.invSlider.destroy();
		DSS.invSlider = null;
	} 
	if(DSS.genSlider  != null)
	{
		DSS.genSlider.destroy();
		DSS.genSlider = null;
	} 
	if(DSS.areaSlider != null) 
	{
		DSS.areaSlider.destroy();
		DSS.areaSlider = null;
	}
	
	DSS.rule_highlight.filter.value = null;
	DSS.rule_highlight.filter.property = null;
};

DSS.initWinPanel = function()
{
	DSS.winPanel = new Ext.Window({
		title: 'Potential Application', //Title of the Window 
		id: 'panelWindowId', //ID of the Window Panel
		autoHeight: true, //Height of the Window will be auto
		width:300, //Width of the Window
		resizable: false, //Resize of the Window, if false - it cannot be resized
		closable: false, //Hide close button of the Window
		modal: false, //When modal:true it make the window modal and mask everything behind it when displayed
		contentEl: 'divWindowId', //ID of the respective 'div'
		buttons:
		[{
			text:'Close', 
		    listeners:{
		    	scope: DSS,
		    	'click': DSS.quit
		    }
		}]
	});
};

DSS.initSliders = function()
{
	var first = DSS.featureArray.get(0);
	var last = DSS.featureArray.getLast();
	
	if(DSS.costSlider == null)
	    DSS.costSlider = new Ext.Slider({
	        renderTo: 'slider-cost',
	        width: DSS.controlWidth,
	        value: (first.cost * DSS.costFactor).toFixed(0),
	        minValue: (first.cost * DSS.costFactor).toFixed(0),
	        maxValue: (last.cost * DSS.costFactor).toFixed(0),
	        plugins: new Ext.ux.SliderTip()
	    });
	//else DSS.costSlider.value = DSS.costSlider.minValue;
	   
    
	if(DSS.invSlider == null)
	    DSS.invSlider = new Ext.Slider({
	        renderTo: 'slider-investment',
	        width: DSS.controlWidth,
	        value: 0,
	        minValue: 0,
	        maxValue: (last.inv / DSS.invFactor).toFixed(0),
	        plugins: new Ext.ux.SliderTip()
	    });
    
	if(DSS.genSlider == null)
	    DSS.genSlider = new Ext.Slider({
	        renderTo: 'slider-generation',
	        width: DSS.controlWidth,
	        value: 0,
	        minValue: 0,
	        maxValue: (last.gen / DSS.genFactor).toFixed(0),
	        plugins: new Ext.ux.SliderTip()
	    });
    
	if(DSS.areaSlider == null)
	    DSS.areaSlider = new Ext.Slider({
	        renderTo: 'slider-area',
	        width: DSS.controlWidth,
	        value: 0,
	        minValue: 0,
	        maxValue: parseInt(last.area),
	        plugins: new Ext.ux.SliderTip()
	    });
	
	document.getElementById(DSS.costEl).innerHTML = DSS.costLabel + parseFloat(first.cost).toFixed(3) + DSS.costUnits;
    
	DSS.costSlider.on('change', DSS.costDragged, this);
	DSS.invSlider.on ('change', DSS.invDragged, this);
	DSS.genSlider.on ('change', DSS.genDragged, this);
	DSS.areaSlider.on('change', DSS.areaDragged, this);
		
};

DSS.setCost = function(value)
{
	DSS.costSlider.setValue(value * DSS.costFactor);
	document.getElementById(DSS.costEl).innerHTML = DSS.costLabel + parseFloat(value).toFixed(3) + DSS.costUnits;
};

DSS.setInv = function(value)
{
	DSS.invSlider.setValue(value / DSS.invFactor);
	document.getElementById(DSS.invEl).innerHTML = DSS.invLabel + (value / 1000).toFixed(0) + DSS.invUnits;
};

DSS.setGen = function(value)
{
	DSS.genSlider.setValue(value / DSS.genFactor);
	document.getElementById(DSS.genEl).innerHTML = DSS.genLabel + (value / 1000).toFixed(0) + DSS.genUnits;
};

DSS.setArea = function(value)
{
	DSS.areaSlider.setValue(value);
	document.getElementById(DSS.areaEl).innerHTML = DSS.areaLabel + parseInt(value) + DSS.areaUnits;
};

DSS.costDragged = function(ed, value, oldValue) 
{	
	if(!DSS.lock)
	{
		DSS.lock = true;
		
		feature = DSS.featureArray.getNearestFromCost(value / DSS.costFactor);
		DSS.setInv(feature.inv);
		DSS.setGen(feature.gen);
		DSS.setArea(feature.area);
		document.getElementById(DSS.costEl).innerHTML = DSS.costLabel + value / DSS.costFactor + DSS.costUnits;
		
		DSS.rule_highlight.filter.value = value / DSS.costFactor;
		DSS.rule_highlight.filter.property = DSS.costField;
		DSS.layerWFS.redraw();
		DSS.lock = false;
	}
};

DSS.invDragged = function(ed, value, oldValue) 
{	
	if(!DSS.lock)
	{
		DSS.lock = true;
		
		feature = DSS.featureArray.getNearestFromInv(value * DSS.invFactor);
		DSS.setCost(feature.cost);
		DSS.setGen(feature.gen);
		DSS.setArea(feature.area);
		document.getElementById(DSS.invEl).innerHTML = DSS.invLabel + value + DSS.invUnits;
		
		//DSS.map.removeLayer(DSS.layerWFS);
		DSS.rule_highlight.filter.value = value * DSS.invFactor;
		DSS.rule_highlight.filter.property = DSS.invField;
		//DSS.map.addLayer(DSS.layerWFS);
		DSS.layerWFS.redraw();
		
		DSS.lock = false;
	}
};

DSS.genDragged = function(ed, value, oldValue) 
{	
	if(!DSS.lock)
	{
		DSS.lock = true;
		
		feature = DSS.featureArray.getNearestFromGen(value * DSS.genFactor);
		DSS.setInv(feature.inv);
		DSS.setCost(feature.cost);
		DSS.setArea(feature.area);
		document.getElementById(DSS.genEl).innerHTML = DSS.genLabel + value + DSS.genUnits;
		
		DSS.rule_highlight.filter.value = value * DSS.genFactor;
		DSS.rule_highlight.filter.property = DSS.genField;
		DSS.layerWFS.redraw();
		DSS.lock = false;
	}
};

DSS.areaDragged = function(ed, value, oldValue) 
{	
	if(!DSS.lock)
	{
		DSS.lock = true;
		
		feature = DSS.featureArray.getNearestFromArea(value);
		DSS.setInv(feature.inv);
		DSS.setGen(feature.gen);
		DSS.setCost(feature.cost);
		document.getElementById(DSS.areaEl).innerHTML = DSS.areaLabel + value + DSS.areaUnits;
		
		DSS.rule_highlight.filter.value = value;
		DSS.rule_highlight.filter.property = DSS.areaField;
		DSS.layerWFS.redraw();
		DSS.lock = false;
	}
};



