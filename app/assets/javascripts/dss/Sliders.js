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
    DSS.potSlider = new Ext.Slider({
        renderTo: 'slider-potential',
        width: 214,
        value: 0,
        minValue: 0,
        maxValue: 1000,
        plugins: new Ext.ux.SliderTip()
    });
    
    DSS.invSlider = new Ext.Slider({
        renderTo: 'slider-investment',
        width: 214,
        value: 0,
        minValue: 0,
        maxValue: 6000,
        plugins: new Ext.ux.SliderTip()
    });
    
    DSS.capSlider = new Ext.Slider({
        renderTo: 'slider-capacity',
        width: 214,
        value: 0,
        minValue: 0,
        maxValue: 10000,
        plugins: new Ext.ux.SliderTip()
    });
    
	DSS.potSlider.on('change', DSS.potDragged, this);
	DSS.capSlider.on('change', DSS.capDragged, this);
	DSS.invSlider.on('change', DSS.newSliderValues, this);	
}

DSS.potDragged = function(ed, value, oldValue) 
{	
	DSS.newSliderValues(DSS.potSlider.thumbs[0].value / 10);
}

DSS.invDragged = function(ed, value, oldValue) 
{	
	DSS.newSliderValues((DSS.invSlider.getValue() + 0.0) / (DSS.invSlider.maxValue + 0.0) * 100);
}

DSS.capDragged = function(ed, value, oldValue) 
{	
	DSS.newSliderValues((DSS.capSlider.getValue() + 0.0) / (DSS.capSlider.maxValue + 0.0) * 100);
}

DSS.newSliderValues = function(percent) 
{	
	if(!DSS.lock)
	{
		// Since the browser is single threaded this is safe.
		DSS.lock = true;
		percent = parseInt(percent);
		
		document.getElementById("percent").innerHTML  = "Potential: "  + percent + " %";
		document.getElementById("invest").innerHTML   = "Investment: " + percent * DSS.invSlider.maxValue / 100 + " k&euro;";
		document.getElementById("capacity").innerHTML = "Capacity: "   + percent * DSS.capSlider.maxValue / 100 + " kWp";
		
		DSS.invSlider.setValue(percent * DSS.invSlider.maxValue / 100);
		DSS.capSlider.setValue(percent * DSS.capSlider.maxValue / 100);
		DSS.potSlider.setValue(percent * DSS.potSlider.maxValue / 100);
		
		DSS.rule_highlight.filter.value = 1000 - DSS.potSlider.getValue();
		DSS.buildsGML.redraw();
		DSS.lock = false;
	}
}

DSS.showWindow = function() {
	
	DSS.winPanel.show();
	
}