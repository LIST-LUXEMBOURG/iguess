var WPS = WPS || {};    // Create namespace object for our functions
var WMS = WMS || {};    // Create namespace object for our functions
var WFS = WFS || {};    // Create namespace object for our functions


WPS.responsesExpected = 0;
WPS.responsesReceived = 0;

WPS.getResponsesExpected = function() { return WPS.responsesExpected; }

////////////////////////////////////////
// Send an initial request to a WPS server to see what services it offers
WPS.probeWPS = function(serverUrl, onDescribedProcessFunction, onReceivedServerInfoFunction) 
{
  WPS.onDescribedProcessFunction   = onDescribedProcessFunction;
  WPS.onReceivedServerInfoFunction = onReceivedServerInfoFunction;
  
  var url = WPS.getCapReq(serverUrl);
  
  // Init the client and run get capabilities
  var wps = new OpenLayers.WPS(url, { onGotCapabilities: WPS.onGetCapabilities,
                                      onException:       showErrorMessage       });
  wps.getCapabilities(url);
};

// This function is called when the getCapabilities response arrives
WPS.onGetCapabilities = function() 
{
  // Trigger callback with name and abstract of server
  WPS.onReceivedServerInfoFunction(this.getCapabilitiesUrlPost, this.title, this.abstract);
  WPS.title = this.title;

  // Further probe the server, process-by-process
  for(var i = 0; i < this.processes.length; i++) {
    WPS.describeProcess(this.describeProcessUrlPost, this.processes[i].identifier, WPS.onDescribedProcessFunction_passthrough);
    WPS.responsesExpected++;
  }
};

// Take returned process object and add the server title
WPS.onDescribedProcessFunction_passthrough = function(process)
{
  WPS.onDescribedProcessFunction(WPS.title, process);
}

showErrorMessage = function (process, code, text) {
	newWin = window.open('', 'Service Error Message', 'height=400, width=600, toolbar=no, menubar=no');
	newWin.document.write("ShowErrorMessage");
	newWin.document.write(process.responseText);
};


showPreErrorMessage = function (process, code, text) {
  newWin = window.open('', 'Service Error Message', 'height=400, width=600, toolbar=no, menubar=no');
  newWin.document.write("ShowPreErrorMessage");

  newWin.document.write("<pre>" + process.responseText + "</pre>");
};
  


WPS.onGetServerInfo = function(xxx)
{
  console.log(xxx);
  
}


// Support code for collecting all the dataTypes available on the specified servers
// Will call onDataTypesDiscovered(dataTypesFound) as data comes in, and onDataTypeDiscoveryCompleted(dataTypesFound)
WPS.probeWPS_getDataTypes = function(url)
{
  WPS.probeWPS(url, onDescribedProcess_getDataTypesProbe); 
};


////////////////////////////////////////
// Describe a process called identifier on server at specified url.  Will call function passed on onDescribedCallback(process) 
// when answer arrives. 
WPS.describeProcess = function(url, identifier, onDescribedCallback) 
{
  var fullUrl = WPS.getDescProcUrl(url, identifier);
  
  var wps = new OpenLayers.WPS(fullUrl, {onDescribedProcess: onDescribedCallback});
  wps.describeProcess(url + ' - ' + identifier);    // This string appears to do nothing at all!
}
    

WPS.onDescribedProcess_getDataTypesProbe_dataTypes = [];
 
// This function is called when the describeProcesses response arrives
// It will be called repeatedly as responses arrive
function onDescribedProcess_getDataTypesProbe(process) 
{
  for(var i = 0; i < process.inputs.length; i++) {
    var id = process.inputs[i].identifier;
   
    if(!WPS.onDescribedProcess_getDataTypesProbe_dataTypes.hasObject(id)) {
      WPS.onDescribedProcess_getDataTypesProbe_dataTypes.push(id);
    } 
  }
  
  WPS.responsesReceived++;
  
  // Call callbacks, if they are defined
  if(typeof onDataTypesDiscovered != 'undefined') {
    onDataTypesDiscovered(WPS.onDescribedProcess_getDataTypesProbe_dataTypes);
  }
  
  if(WPS.responsesReceived == WPS.responsesExpected) { 
    if(typeof onDataTypeDiscoveryCompleted != 'undefined') {
      onDataTypeDiscoveryCompleted(WPS.onDescribedProcess_getDataTypesProbe_dataTypes);
    } 
  }
}


// Probe a WMS and detect which layers are available 
WMS.updateLayerList = function(serverUrl, successFunction, failureFunction) {
  jQuery('.form_error_message').text("");    // Clear all error messages
  // $('#refresh_layers_button').attr('disabled', true);
  jQuery('#layers_loading_indicator').show();

  var fullUrl = WMS.getCapReq(serverUrl);
  
  var store = new GeoExt.data.WMSCapabilitiesStore({ url: fullUrl });
      
  // Add some callbacks to handle various situations  
  store.on('load', successFunction);
  store.on('exception', failureFunction);

  store.load(); 
};


// Probe a WFS and detect which layers are available 
WFS.updateLayerList = function(serverUrl, successFunction, failureFunction) {
  var fullUrl = WFS.getCapReq(serverUrl);
  
  var store = new GeoExt.data.WFSCapabilitiesStore({ url: fullUrl });
  
  // Add some callbacks to handle various situations  
  store.on('load', successFunction);
  store.on('exception', failureFunction);

  store.load();
};

 
var geoProxyPrefix = '/home/geoproxy?url=';

var wrapGeoProxy = function(url) { 
	// alert('http://localhost:3000/home/geoproxy?url=' + encodeURIComponent(url));
  return geoProxyPrefix + encodeURIComponent(url); 
}

var unwrapGeoProxy = function(url) {
  return url.replace(geoProxyPrefix, '');
}

var getJoinChar = function(url) {
	return(url.indexOf("?") == -1 ? "?" : "&");
}

// WMS functions

WMS.getCapStr = 'VERSION=1.3.0&REQUEST=GetCapabilities&SERVICE=WMS';

WMS.getCapReq = function(serverUrl) { 
	//alert('WMS -- http://localhost:3000' + wrapGeoProxy(serverUrl + '?VERSION=1.1.1&REQUEST=GetCapabilities&SERVICE=WMS'));
	var joinchar = getJoinChar(serverUrl);
  return wrapGeoProxy(serverUrl + joinchar + WMS.getCapStr); 
}

WMS.stripGetCapReq = function(serverUrl) {
  return serverUrl.replace(WMS.getCapStr, '').slice(0, -1);   // slice strips last char
}


WFS.getCapStr = 'SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities';

WFS.getCapReq = function(serverUrl) {
  var joinchar = getJoinChar(serverUrl);
  // alert(wrapGeoProxy(serverUrl + joinchar + WFS.getCapStr));
  return wrapGeoProxy(serverUrl + joinchar + WFS.getCapStr);
}

WFS.stripGetCapReq = function(serverUrl) {
  return serverUrl.replace(WFS.getCapStr, '').slice(0, -1);   // slice strips last char
}


// Helper functions for creating and deconstructing urls
WPS.getCapStr = 'VERSION=1.0.0&REQUEST=GetCapabilities&SERVICE=WPS';

WPS.getCapReq = function(serverUrl) { 
	// alert('WPS -- http://localhost:3000' + wrapGeoProxy(serverUrl + '?VERSION=1.0.0&REQUEST=GetCapabilities&SERVICE=WPS'));
	var joinchar = getJoinChar(serverUrl);
  return wrapGeoProxy(serverUrl + joinchar + WPS.getCapStr); 
}

WPS.stripGetCapReq = function(serverUrl) {
  return serverUrl.replace(WPS.getCapStr, '').slice(0, -1);  // slice strips last char
}


WPS.getDescrProcString = function (layerIdentifier) {
  return 'SERVICE=WPS&VERSION=1.0.0&REQUEST=DescribeProcess&IDENTIFIER=' + layerIdentifier;
}
 
WPS.getDescProcUrl = function(serverUrl, layerIdentifier) { 
	var joinchar = getJoinChar(serverUrl);
  return wrapGeoProxy(serverUrl + joinchar + WPS.getDescrProcString(layerIdentifier)); 
}

WPS.unwrapServer = function(url) {
  return WPS.stripGetCapReq(decodeURIComponent(unwrapGeoProxy(url)));
}

WPS.stripDescProc = function(serverUrl, layerIdentifier) {
  return serverUrl.replace(WPS.getDescrProcString(layerIdentifier), '').slice(0, -1);  // slice strips last char
}

WPS.unwrapProcServer = function(url, layerIdentifier) {
  return WPS.stripDescProc(decodeURIComponent(unwrapGeoProxy(url)), layerIdentifier);
}

WFS.unwrapServer = function(url) {
  return WFS.stripGetCapReq(decodeURIComponent(unwrapGeoProxy(url)));
}

WMS.unwrapServer = function(url) {
  return WMS.stripGetCapReq(decodeURIComponent(unwrapGeoProxy(url)));
}

