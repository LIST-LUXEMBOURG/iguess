var WPS = WPS || {};    // Create namespace object for our functions
var WMS = WMS || {};    // Create namespace object for our functions
var WFS = WFS || {};    // Create namespace object for our functions


WPS.responsesExpected = 0;
WPS.responsesReceived = 0;


WPS.getResponsesExpected = function() { return WPS.responsesExpected; };


WPS.probing = [];       // List of servers already being probed

////////////////////////////////////////
// Send an initial request to a WPS server to see what services it offers
WPS.probeWPS = function(serverUrl, onReceivedServerInfoFunction, onDescribedProcessFunction)
{
  if(WPS.probing.hasObject(serverUrl)) { return; }      // Already probing, nothing to do

  WPS.probing.push(serverUrl);
  WPS.serverUrl = serverUrl;

  WPS.onReceivedServerInfoFunction = onReceivedServerInfoFunction;
  WPS.onDescribedProcessFunction   = onDescribedProcessFunction;

  var url = WPS.getCapReq(serverUrl);

  // Init the client and run get capabilities.  When a response arrives, we call the function onGotCapabilities
  var wps = new OpenLayers.WPS(url, { onGotCapabilities: WPS.onGetCapabilities,
                                      onSucceeded:   function() { alert('succ');},
                                      onStarted:     function() { alert('start');},
                                      onFailed:      function() { alert('fail');},
                                      onAccepted:    function() { alert('acc');},
                                      onException:   showErrorMessage2  });

    // http://localhost:3000/home/geoproxy?url=http%3A%2F%2Figuess.tudor.lu%2Fcgi-bin%2Fpywps.cgi%3FVERSION%3D1.0.0%26REQUEST%3DGetCapabilities%26SERVICE%3DWPS
    // http://iguess.tudor.lu/cgi-bin/pywps.cgi?VERSION=1.0.0&REQUEST=GetCapabilities&SERVICE=WP

  wps.getCapabilities(url);
};

// This function is called when the getCapabilities response arrives
WPS.onGetCapabilities = function()
{
  // Trigger callback with name and abstract of server
  if(WPS.onReceivedServerInfoFunction != null && WPS.onReceivedServerInfoFunction != undefined) {
    WPS.onReceivedServerInfoFunction(this.getCapabilitiesUrlPost, this.title, this.abstract, this.processes);
  }
  WPS.title = this.title;

  // Further probe the server, process-by-process, but only if we have a onDescribedProcessFunction defined.
  // If we don't, there is no real point to further probing.
  if(WPS.onDescribedProcessFunction != null && WPS.onDescribedProcessFunction != undefined) {
    var len = this.processes.length;
    for(var i = 0; i < len; i++) {
      WPS.describeProcess(this.describeProcessUrlPost, this.processes[i].identifier, WPS.onDescribedProcessFunction_passthrough);
      WPS.responsesExpected++;
    }
  }
};

// Take returned process object and add the server title
WPS.onDescribedProcessFunction_passthrough = function(process)
{
  WPS.onDescribedProcessFunction(process, WPS.title, WPS.serverUrl);
};

showErrorMessage = function (process, code, text) {
  console.log(arguments);
    // alert("ERROR");
	// newWin = window.open('', 'Service Error Message', 'height=400, width=600, toolbar=no, menubar=no');
	// newWin.document.write("ShowErrorMessage");
 //  newWin.document.write("There was an error retrieving your data.");
	// newWin.document.write(process.responseText);
//    newWin.document.write(code);
//    newWin.document.write(text);
};


// This will get called if the wps url points to a server that doesn't much exist.... TODO: something
// We got back an error from one of our requested processes... do something useful
showErrorMessage2 = function (request) {
    // alert(request.statusText);
    // newWin = window.open('', 'Service Error Message', 'height=400, width=600, toolbar=no, menubar=no');
    // newWin.document.write("ShowErrorMessage");
    // newWin.document.write("There was an error retrieving your data.");
    // newWin.document.write(process.responseText);
//    newWin.document.write(code);
//    newWin.document.write(text);
};


showPreErrorMessage = function (process, code, text) {
  // newWin = window.open('', 'Service Error Message', 'height=400, width=600, toolbar=no, menubar=no');
  // newWin.document.write("ShowPreErrorMessage");

  // newWin.document.write("<pre>" + process.responseText + "</pre>");
};



WPS.onGetServerInfo = function()
{
  console.log(arguments);
};


// Support code for collecting all the dataTypes available on the specified servers
// Will call onDataTypesDiscovered(dataTypesFound) as data comes in, and onDataTypeDiscoveryCompleted(dataTypesFound)
WPS.probeWPS_getDataTypes = function(url)
{
  WPS.probeWPS(url, null, onDescribedProcess_getDataTypesProbe);
};


////////////////////////////////////////
// Describe a process called identifier on server at specified url.  Will call function passed on onDescribedCallback(process)
// when answer arrives.

var got = function() { alert(3); };


WPS.describeProcess = function(url, identifier, onDescribedCallback)
{
  var fullUrl = WPS.getDescProcUrl(url, identifier);

  var wps = new OpenLayers.WPS(fullUrl, { onDescribedProcess: onDescribedCallback,
                                          onGotCapabilities:  got,
                                          onException:        showErrorMessage });
  wps.describeProcess(url + ' - ' + identifier);    // This string appears to do nothing at all!
};



// sample wps error handling function
//function onError(process){
// textData="Error Code:"+process.exception.code+"<br />"+"Text:"+process.exception.text;

WPS.onDescribedProcess_getDataTypesProbe_complexDataTypes = [];

function findDatasetById(datasets, id)
{
    var len = datasets.length;
    for(var i = 0; i < len; i++) {
        if(datasets[i].id == id) {
            return true;
        }
    }

    return false;
};

// This function is called when the describeProcesses response arrives
// It will be called repeatedly as responses arrive
function onDescribedProcess_getDataTypesProbe(process)
{
  var len = process.inputs.length;
  for(var i = 0; i < len; i++) {
    var id   = process.inputs[i].identifier;
    var type = process.inputs[i].type;
    var title = process.inputs[i].title || id;

    // For the moment, skip all "simple" datatypes.  This may need to be changed in the future.
    if(type != undefined) { continue; }

    if(!findDatasetById(WPS.onDescribedProcess_getDataTypesProbe_complexDataTypes, id)) {
      var dataType = { id: id, title: title };
      WPS.onDescribedProcess_getDataTypesProbe_complexDataTypes.push(dataType);
    }
  }

  WPS.responsesReceived++;

  // Call callbacks, if they are defined
  if(typeof onDataTypesDiscovered != 'undefined') {
    onDataTypesDiscovered(WPS.onDescribedProcess_getDataTypesProbe_complexDataTypes);
  }

  if(WPS.responsesReceived == WPS.responsesExpected) {
    if(typeof onDataTypeDiscoveryCompleted != 'undefined') {
      onDataTypeDiscoveryCompleted(WPS.onDescribedProcess_getDataTypesProbe_complexDataTypes);
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
  store.on('load',      successFunction);
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
};

var unwrapGeoProxy = function(url) {
  return url.replace(geoProxyPrefix, '');
};

var getJoinChar = function(url) {
	return(url.indexOf("?") == -1 ? "?" : "&");
};

// WMS functions

WMS.getCapStr = 'VERSION=1.3.0&REQUEST=GetCapabilities&SERVICE=WMS';

WMS.getCapReq = function(serverUrl) {
	//alert('WMS -- http://localhost:3000' + wrapGeoProxy(serverUrl + '?VERSION=1.1.1&REQUEST=GetCapabilities&SERVICE=WMS'));
	var joinchar = getJoinChar(serverUrl);
  return wrapGeoProxy(serverUrl + joinchar + WMS.getCapStr);
};

WMS.stripGetCapReq = function(serverUrl) {
  return serverUrl.replace(WMS.getCapStr, '').slice(0, -1);   // slice strips last char
};


WFS.getCapStr = 'SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities';

WFS.getCapReq = function(serverUrl) {
  var joinchar = getJoinChar(serverUrl);
  // alert(wrapGeoProxy(serverUrl + joinchar + WFS.getCapStr));
  return wrapGeoProxy(serverUrl + joinchar + WFS.getCapStr);
};

WFS.stripGetCapReq = function(serverUrl) {
  return serverUrl.replace(WFS.getCapStr, '').slice(0, -1);   // slice strips last char
};

// Helper functions for creating and deconstructing urls
WPS.getCapStr = 'VERSION=1.0.0&REQUEST=GetCapabilities&SERVICE=WPS';

WPS.getCapReq = function(serverUrl) {
	// alert('WPS -- http://localhost:3000' + wrapGeoProxy(serverUrl + '?VERSION=1.0.0&REQUEST=GetCapabilities&SERVICE=WPS'));
	var joinchar = getJoinChar(serverUrl);
  return wrapGeoProxy(serverUrl + joinchar + WPS.getCapStr);
};

WPS.stripGetCapReq = function(serverUrl) {
  return serverUrl.replace(WPS.getCapStr, '').slice(0, -1);  // slice strips last char
};


WPS.getDescrProcString = function (layerIdentifier) {
  return 'SERVICE=WPS&VERSION=1.0.0&REQUEST=DescribeProcess&IDENTIFIER=' + layerIdentifier;
};

WPS.getDescProcUrl = function(serverUrl, layerIdentifier) {
	var joinchar = getJoinChar(serverUrl);
  return wrapGeoProxy(serverUrl + joinchar + WPS.getDescrProcString(layerIdentifier));
};

WPS.unwrapServer = function(url) {
  return WPS.stripGetCapReq(decodeURIComponent(unwrapGeoProxy(url)));
};

WPS.stripDescProc = function(serverUrl, layerIdentifier) {
  return serverUrl.replace(WPS.getDescrProcString(layerIdentifier), '').slice(0, -1);  // slice strips last char
};

WPS.unwrapProcServer = function(url, layerIdentifier) {
  return WPS.stripDescProc(decodeURIComponent(unwrapGeoProxy(url)), layerIdentifier);
};

WFS.unwrapServer = function(url) {
  return WFS.stripGetCapReq(decodeURIComponent(unwrapGeoProxy(url)));
};

WMS.unwrapServer = function(url) {
  return WMS.stripGetCapReq(decodeURIComponent(unwrapGeoProxy(url)));
};


unwrapServer = function(url, format)
{
    if(format == 'WFSCapabilities') { return WFS.unwrapServer(url); }
    if(format == 'WMSCapabilities') { return WMS.unwrapServer(url); }
    return null;
};
