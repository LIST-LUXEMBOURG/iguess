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
//= require dss/Map

var DSS = DSS || { };

DSS.lock = false;

DSS.potSlider = null;
DSS.capSlider = null; 
DSS.invSlider = null;

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
		width:330, //Width of the Window
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
	        minValue: 90,
	        maxValue: 200,
	        plugins: new Ext.ux.SliderTip()
	    });
    
	if(DSS.invSlider == null)
	    DSS.invSlider = new Ext.Slider({
	        renderTo: 'slider-investment',
	        width: 214,
	        value: 0,
	        minValue: 0,
	        maxValue: 45600,
	        plugins: new Ext.ux.SliderTip()
	    });
    
	if(DSS.genSlider == null)
	    DSS.genSlider = new Ext.Slider({
	        renderTo: 'slider-generation',
	        width: 214,
	        value: 0,
	        minValue: 0,
	        maxValue: 17000,
	        plugins: new Ext.ux.SliderTip()
	    });
    
	if(DSS.areaSlider == null)
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
		DSS.layerWFS.redraw();
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
		DSS.layerWFS.redraw();
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
		DSS.layerWFS.redraw();
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
		DSS.layerWFS.redraw();
		DSS.lock = false;
	}
};



