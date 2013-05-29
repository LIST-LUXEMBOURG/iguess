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
        minValue: 0,
        maxValue: 200,
        plugins: new Ext.ux.SliderTip()
    });
    
    DSS.invSlider = new Ext.Slider({
        renderTo: 'slider-investment',
        width: 214,
        value: 0,
        minValue: 0,
        maxValue: 450,
        plugins: new Ext.ux.SliderTip()
    });
    
    DSS.areaSlider = new Ext.Slider({
        renderTo: 'slider-area',
        width: 214,
        value: 0,
        minValue: 0,
        maxValue: 3500,
        plugins: new Ext.ux.SliderTip()
    });
    
	DSS.costSlider.on('change', DSS.costDragged, this);
	DSS.areaSlider.on('change', DSS.areaDragged, this);
	DSS.invSlider.on('change', DSS.invDragged, this);	
}

updateLabels = function(percent)
{
	cost = (percent * DSS.costSlider.maxValue / 100 / 1000).toFixed(3);
	invest = (percent * DSS.invSlider.maxValue / 100).toFixed(3);
	area = (percent * DSS.areaSlider.maxValue / 100).toFixed(0);
	
	document.getElementById("cost").innerHTML   = "Cost: "  	 + cost + " &euro;/kWh";
	document.getElementById("invest").innerHTML = "Investment: " + invest + " k&euro;";
	document.getElementById("area").innerHTML   = "Area: "   	 + area + " m2";
}

DSS.costDragged = function(ed, value, oldValue) 
{	
	if(!DSS.lock)
	{
		DSS.lock = true;
		
		percent = parseFloat(value) / DSS.costSlider.maxValue * 100;
		updateLabels(percent);
		
		//DSS.costSlider.setValue(percent * DSS.costSlider.maxValue / 100);
		DSS.invSlider.setValue(percent * DSS.invSlider.maxValue / 100);
		DSS.areaSlider.setValue(percent * DSS.areaSlider.maxValue / 100);
		
		
		DSS.rule_highlight.filter.value = value / 1000;
		DSS.rule_highlight.filter.property = "multi_c_e";
		DSS.buildsGML.redraw();
		DSS.lock = false;
	}
}

DSS.invDragged = function(ed, value, oldValue) 
{	
	if(!DSS.lock)
	{
		DSS.lock = true;
		
		percent = parseFloat(value) / DSS.invSlider.maxValue * 100;
		updateLabels(percent);
		
		DSS.costSlider.setValue(percent * DSS.costSlider.maxValue / 100);
		//DSS.invSlider.setValue(percent * DSS.invSlider.maxValue / 100);
		DSS.areaSlider.setValue(percent * DSS.areaSlider.maxValue / 100);
		
		DSS.rule_highlight.filter.value = value * 1000;
		DSS.rule_highlight.filter.property = "cum_multi";
		DSS.buildsGML.redraw();
		DSS.lock = false;
	}
}

DSS.areaDragged = function(ed, value, oldValue) 
{	
	if(!DSS.lock)
	{
		DSS.lock = true;
		
		percent = parseFloat(value) / DSS.areaSlider.maxValue * 100;
		updateLabels(percent);
		
		DSS.costSlider.setValue(percent * DSS.costSlider.maxValue / 100);
		DSS.invSlider.setValue(percent * DSS.invSlider.maxValue / 100);
		//DSS.areaSlider.setValue(percent * DSS.areaSlider.maxValue / 100);
		
		DSS.rule_highlight.filter.value = value;
		DSS.rule_highlight.filter.property = "cum_area";
		DSS.buildsGML.redraw();
		DSS.lock = false;
	}
}

DSS.showWindow = function() {
	
	DSS.winPanel.show();
	
}