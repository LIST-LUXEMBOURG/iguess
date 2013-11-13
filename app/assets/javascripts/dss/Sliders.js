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

DSS.featureArray = null;

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
		fillColor: "#FF7144",
		fillOpacity: 0.5,
		strokeColor: "#FF7144",
		strokeWidth: 2,
		strokeDashstyle: "solid",
	}
});

DSS.style.addRules([DSS.rule_fsa, DSS.rule_highlight]);

DSS.showWindow = function() 
{	
	DSS.winPanel.show();	
};

DSS.quit = function()
{
	DSS.winPanel.hide();
	DSS.winSelect.hide();
	//WebGIS.leftMap.removeLayer(DSS.layerWFS);
	DSS.map.removeLayer(DSS.layerWFS);	
};

DSS.initWinPanel = function()
{
	DSS.winPanel = new Ext.Window({
		title: 'Potential Application', //Title of the Window 
		id: 'panelWindowId', //ID of the Window Panel
		autoHeight: true, //Height of the Window will be auto
		width:340, //Width of the Window
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
	if(DSS.costSlider == null)
	    DSS.costSlider = new Ext.Slider({
	        renderTo: 'slider-cost',
	        width: 214,
	        value: 0,
	        //minValue: 90,
	        minValue: (DSS.featureArray.get(0).cost * DSS.costFactor).toFixed(0),
	        //maxValue: 200,
	        maxValue: (DSS.featureArray.getLast().cost * DSS.costFactor).toFixed(0),
	        plugins: new Ext.ux.SliderTip()
	    });
    
	if(DSS.invSlider == null)
	    DSS.invSlider = new Ext.Slider({
	        renderTo: 'slider-investment',
	        width: 214,
	        value: 0,
	        minValue: 0,
	        //maxValue: 45600,
	        maxValue: (DSS.featureArray.getLast().inv / DSS.invFactor).toFixed(0),
	        plugins: new Ext.ux.SliderTip()
	    });
    
	if(DSS.genSlider == null)
	    DSS.genSlider = new Ext.Slider({
	        renderTo: 'slider-generation',
	        width: 214,
	        value: 0,
	        minValue: 0,
	        //maxValue: 17000,
	        maxValue: (DSS.featureArray.getLast().gen / DSS.genFactor).toFixed(0),
	        plugins: new Ext.ux.SliderTip()
	    });
    
	if(DSS.areaSlider == null)
	    DSS.areaSlider = new Ext.Slider({
	        renderTo: 'slider-area',
	        width: 214,
	        value: 0,
	        minValue: 0,
	        //maxValue: 166000,
	        maxValue: parseInt(DSS.featureArray.getLast().area),
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

DSS.setCost = function(value)
{
	DSS.costSlider.setValue(value * DSS.costFactor);
	document.getElementById("cost").innerHTML = "Cost: " + value + " &euro;/kWh";
};

DSS.setInv = function(value)
{
	DSS.invSlider.setValue(value / DSS.invFactor);
	document.getElementById("invest").innerHTML = "Investment: " + (value / 1000).toFixed(0) + " k&euro;";
};

DSS.setGen = function(value)
{
	DSS.genSlider.setValue(value / DSS.genFactor);
	document.getElementById("gen").innerHTML = "Generation: " + (value / 1000).toFixed(0) + " MWh/a";
};

DSS.setArea = function(value)
{
	DSS.areaSlider.setValue(value);
	document.getElementById("area").innerHTML = "Area: " + parseInt(value) + " m2";
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
		document.getElementById("cost").innerHTML = "Cost: " + value / DSS.costFactor + " &euro;/kWh";
		
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
		
		/*percent = parseFloat(value) / DSS.invSlider.maxValue * 100;
		DSS.updateLabels(percent);
		
		DSS.costSlider.setValue(DSS.calcCostValue(percent));
		DSS.genSlider.setValue(percent * DSS.genSlider.maxValue / 100);
		DSS.areaSlider.setValue(percent * DSS.areaSlider.maxValue / 100);*/
		
		feature = DSS.featureArray.getNearestFromInv(value * DSS.invFactor);
		DSS.setCost(feature.cost);
		DSS.setGen(feature.gen);
		DSS.setArea(feature.area);
		document.getElementById("invest").innerHTML = "Investment: " + value + " k&euro;";
		
		DSS.rule_highlight.filter.value = value * DSS.invFactor;
		DSS.rule_highlight.filter.property = DSS.invField;
		DSS.layerWFS.redraw();
		DSS.lock = false;
	}
};

DSS.genDragged = function(ed, value, oldValue) 
{	
	if(!DSS.lock)
	{
		DSS.lock = true;
		
		/*percent = parseFloat(value) / DSS.genSlider.maxValue * 100;
		DSS.updateLabels(percent);
		
		DSS.costSlider.setValue(DSS.calcCostValue(percent));
		DSS.invSlider.setValue(percent * DSS.invSlider.maxValue / 100);
		DSS.areaSlider.setValue(percent * DSS.areaSlider.maxValue / 100);*/
		
		feature = DSS.featureArray.getNearestFromGen(value * DSS.genFactor);
		DSS.setInv(feature.inv);
		DSS.setCost(feature.cost);
		DSS.setArea(feature.area);
		document.getElementById("gen").innerHTML = "Generation: " + value + " MWh/a";
		
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
		
		/*percent = parseFloat(value) / DSS.areaSlider.maxValue * 100;
		DSS.updateLabels(percent);
		
		DSS.costSlider.setValue(DSS.calcCostValue(percent));
		DSS.invSlider.setValue(percent * DSS.invSlider.maxValue / 100);
		DSS.genSlider.setValue(percent * DSS.genSlider.maxValue / 100);*/
		
		feature = DSS.featureArray.getNearestFromArea(value);
		DSS.setInv(feature.inv);
		DSS.setGen(feature.gen);
		DSS.setCost(feature.cost);
		document.getElementById("area").innerHTML = "Area: " + value + " m2";
		
		DSS.rule_highlight.filter.value = value;
		DSS.rule_highlight.filter.property = DSS.areaField;
		DSS.layerWFS.redraw();
		DSS.lock = false;
	}
};



