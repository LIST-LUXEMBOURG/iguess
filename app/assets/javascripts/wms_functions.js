// From https://github.com/opengeo/gxp/blob/master/src/script/plugins/WMSSource.js
/**
 * The WMSCapabilities and WFSDescribeFeatureType formats parse the document and
 * pass the raw data to the WMSCapabilitiesReader/AttributeReader.  There,
 * records are created from layer data.  The rest of the data is lost.  It
 * makes sense to store this raw data somewhere - either on the OpenLayers
 * format or the GeoExt reader.  Until there is a better solution, we'll
 * override the reader's readRecords method  here so that we can have access to
 * the raw data later.
 * 
 * The purpose of all of this is to get the service title, feature type and
 * namespace later.
 */
(function() {
function keepRaw(data) {
    var format = this.meta.format;
    if (typeof data === "string" || data.nodeType) {
        data = format.read(data);
        // cache the data for the single read that readRecord does
        var origRead = format.read;
        format.read = function() {
            format.read = origRead;
            return data;
        };
    }
    // Here, this is the WXSGetCapabilitiesReader
    this.raw = data;
}

Ext.intercept(GeoExt.data.WFSCapabilitiesReader.prototype, "readRecords", keepRaw);
Ext.intercept(GeoExt.data.WMSCapabilitiesReader.prototype, "readRecords", keepRaw);
Ext.intercept(GeoExt.data.WCSCapabilitiesReader.prototype, "readRecords", keepRaw);

GeoExt.data.AttributeReader &&
    Ext.intercept(GeoExt.data.AttributeReader.prototype, "readRecords", keepRaw);
})();


// Create namespace object for our functions
var WPS = WPS || { };
var WMS = WMS || { };
var WFS = WFS || { };
var WCS = WCS || { };
var COMMON = COMMON || { };


WPS.responsesExpected = 0;
WPS.responsesReceived = 0;


WPS.getResponsesExpected = function() { return WPS.responsesExpected; };


WPS.probing = [];       // List of servers already being probed
WPS.getCapResponsesReceived = 0;

////////////////////////////////////////
// Send an initial request to a WPS server to see what services it offers
// onReceivedServerInfoFunction will be called when we get a response from a server, once per server
// onDescribedProcessFunction will be called once for each process at each server
WPS.probeWPS = function(serverUrl, onReceivedServerInfoFunction, onDescribedProcessFunction)
{
  if(WPS.probing.hasObject(serverUrl)) { return; }      // Already probing, nothing to do

  WPS.probing.push(serverUrl);
  WPS.serverUrl = serverUrl;

  WPS.onReceivedServerInfoFunction = onReceivedServerInfoFunction;
  WPS.onDescribedProcessFunction   = onDescribedProcessFunction;

  var url = WPS.getCapReq(serverUrl);
  // alert(url);
  // Init the client and run get capabilities.  When a response arrives, we call the function onGotCapabilities
  var wps = new OpenLayers.WPS(url, { onGotCapabilities: WPS.onGotCapabilities,
                                      onSucceeded:   function() { alert('succ');},
                                      onStarted:     function() { alert('start');},
                                      onFailed:      function() { alert('fail');},
                                      onAccepted:    function() { alert('acc');},
                                      onException:   WPS.getCapabilitiesError });

  wps.getCapabilities(url);
};

// This function is called when the getCapabilities response arrives
WPS.onGotCapabilities = function()
{
  WPS.getCapResponsesReceived++;

  // Trigger callback with name and abstract of server
  if(WPS.onReceivedServerInfoFunction != null && WPS.onReceivedServerInfoFunction != undefined) {
    WPS.onReceivedServerInfoFunction(this.getCapabilitiesUrlPost, this.title, this.abstract, this.processes, this.serviceProvider);
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
  console.log("showErrorMessage", arguments);
};


var onWpsError = function() { };    // Override to do something!


// This will get called if the wps url points to a server that doesn't much exist, or is not answering the phone, or something...
WPS.getCapabilitiesError = function (request) {
  onWpsError(WPS.unwrapServer(this.describeProcessUrlGet));
  WPS.getCapResponsesReceived++;

  if(WPS.getCapResponsesReceived === WPS.probing.length && 
     WPS.responsesExpected       === WPS.responsesReceived) {
    WPS.dataTypeDiscoveryCompleted();
  }
};


showPreErrorMessage = function (process, code, text) {
  // newWin = window.open('', 'Service Error Message', 'height=400, width=600, toolbar=no, menubar=no');
  // newWin.document.write("ShowPreErrorMessage");

  // newWin.document.write("<pre>" + process.responseText + "</pre>");
};


WPS.onGetServerInfo = function()
{
  console.log("WPS.onGetServerInfo", arguments);
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
  for(var i = 0, len = process.inputs.length; i < len; i++) {
    var identifier = process.inputs[i].identifier;
    var type       = process.inputs[i].type;
    var title      = process.inputs[i].title || identifier;

    // For the moment, skip all "simple" datatypes.  This may need to be changed in the future.
    if(type != undefined) { continue; }

    if(!findDatasetById(WPS.onDescribedProcess_getDataTypesProbe_complexDataTypes, identifier)) {
      var tag = { id: identifier, title: title };
      WPS.onDescribedProcess_getDataTypesProbe_complexDataTypes.push(tag);
    }
  }

  WPS.gotResponse();
}


WPS.gotResponse = function()
{

  WPS.responsesReceived++;

  // // Call callbacks, if they are defined
  // if(typeof onDataTypesDiscovered != 'undefined') {
  //   onDataTypesDiscovered(WPS.onDescribedProcess_getDataTypesProbe_complexDataTypes);
  // }

  if(WPS.responsesReceived == WPS.responsesExpected) {
    WPS.dataTypeDiscoveryCompleted(WPS.onDescribedProcess_getDataTypesProbe_complexDataTypes);
  }
}


// We run this when we have all the expected replies from the WPS servers we sent out earlier
WPS.dataTypeDiscoveryCompleted = function(dataTypes)
{
  $('data-type-dropdown').show();
  // populateSelectBox(document.getElementById("add-tag-dropdown-control"), dataTypes);
  DataTagList = dataTypes ? dataTypes.sort() : [];
  dataDiscoveryComplete = true;


  // Call external event handler, if it exists
  if(typeof onDataTypeDiscoveryCompleted === 'function') {
    onDataTypeDiscoveryCompleted(DataTagList);
  }
}


// Probe a WMS and detect which layers are available
WMS.updateLayerList = function(serverUrl, successFunction, failureFunction) {
  jQuery('.form_error_message').text("");    // Clear all error messages
  // $('#refresh_layers_button').attr('disabled', true);

  jQuery('#layers_loading_indicator').show();

  var fullUrl = WMS.getCapReq(serverUrl);

  var store = new GeoExt.data.WMSCapabilitiesStore({ url: fullUrl });

  COMMON.updateLayerList(store, successFunction, failureFunction);
};



// Probe a WFS and detect which layers are available
WFS.updateLayerList = function(serverUrl, successFunction, failureFunction) {
  var fullUrl = WFS.getCapReq(serverUrl);

  var store = new GeoExt.data.WFSCapabilitiesStore({ url: fullUrl });
  COMMON.updateLayerList(store, successFunction, failureFunction);
};


// Probe a WCS and detect which layers are available.  Need two calls to get all the required info.  Lame.
WCS.updateLayerList = function(serverUrl, successFunction, failureFunction) {
  var fullUrl, store;

  fullUrl = WCS.getCapReq(serverUrl);
  store = new GeoExt.data.WCSCapabilitiesStore({ url: fullUrl });
  COMMON.updateLayerList(store, successFunction, failureFunction);

  fullUrl = WCS.descCovReq(serverUrl);
  store = new GeoExt.data.WCSDescribeCoverageStore({ url: fullUrl });
  COMMON.updateLayerList(store, successFunction, failureFunction);
};


// Helper for WFS, WMS, and WCS.updateLayerList 
COMMON.updateLayerList = function(store, successFunction, failureFunction) {
  // Add some callbacks to handle various situations
  store.on('load',      successFunction);
  store.on('exception', failureFunction);
  store.load();
}


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


// Version info
WMS.version = '1.3.0';
WFS.version = '1.0.0';    // Still having problems with 1.1.0; use 1.0.0 for now
WCS.version = '1.1.0';
WPS.version = '1.0.0';

//http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/LB_localOWS_test.map&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities
//http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities

// WMS functions
WMS.getCapStr = 'SERVICE=WMS&VERSION=' + WMS.version + '&REQUEST=GetCapabilities';

WMS.getCapUrl = function(serverUrl) {
  var joinchar = getJoinChar(serverUrl);
  return serverUrl + joinchar + WMS.getCapStr;
}

WMS.getCapReq = function(serverUrl) {
  return wrapGeoProxy(WMS.getCapUrl(serverUrl));
};

WMS.stripReq = function(serverUrl) {
  return serverUrl.replace(WMS.getCapStr, '').slice(0, -1);   // slice strips last char
};


// http://www.mail-archive.com/users@geoext.org/msg01843.html
WFS.getCapStr = 'SERVICE=WFS&VERSION=' + WFS.version + '&REQUEST=GetCapabilities';    

WFS.getCapUrl = function(serverUrl) {
  var joinchar = getJoinChar(serverUrl);
  return serverUrl + joinchar + WFS.getCapStr;
}


WFS.getCapReq = function(serverUrl) {
  return wrapGeoProxy(WFS.getCapUrl(serverUrl));
};

WFS.stripReq = function(serverUrl) {
  return serverUrl.replace(WFS.getCapStr, '').slice(0, -1);   // slice strips last char
};


// http://www.mail-archive.com/users@geoext.org/msg01843.html
WCS.getCapStr = 'SERVICE=WCS&VERSION=' + WCS.version + '&REQUEST=GetCapabilities';   

WCS.getCapUrl = function(serverUrl) {
  var joinchar = getJoinChar(serverUrl);
  return serverUrl + joinchar + WCS.getCapStr;
}


WCS.descCovStr = 'SERVICE=WCS&VERSION=' + WCS.version + '&REQUEST=DescribeCoverage';   

WCS.descCovUrl = function(serverUrl) {
  var joinchar = getJoinChar(serverUrl);
  return serverUrl + joinchar + WCS.descCovStr;
}


WCS.getCapReq = function(serverUrl) {
  return wrapGeoProxy(WCS.getCapUrl(serverUrl));
};

WCS.stripReq = function(serverUrl) {
  return serverUrl.replace(WCS.getCapStr, '').replace(WCS.descCovStr, '').slice(0, -1);   // slice strips last char
};


WCS.descCovReq = function(serverUrl) {
  return wrapGeoProxy(WCS.descCovUrl(serverUrl));
}


// Helper functions for creating and deconstructing urls
WPS.getCapStr = 'SERVICE=WPS&VERSION=' + WPS.version + '&REQUEST=GetCapabilities';

WPS.getCapReq = function(serverUrl) {
	// alert('WPS -- http://localhost:3000' + wrapGeoProxy(serverUrl + '?VERSION=1.0.0&REQUEST=GetCapabilities&SERVICE=WPS'));
	var joinchar = getJoinChar(serverUrl);
  return wrapGeoProxy(serverUrl + joinchar + WPS.getCapStr);
};

WPS.stripReq = function(serverUrl) {
  return serverUrl.replace(WPS.getCapStr, '').slice(0, -1);  // slice strips last char
};


WPS.getDescrProcString = function (layerIdentifier) {
  return 'SERVICE=WPS&VERSION=' + WPS.version + '&REQUEST=DescribeProcess&IDENTIFIER=' + layerIdentifier;
};

WPS.getDescProcUrl = function(serverUrl, layerIdentifier) {
	var joinchar = getJoinChar(serverUrl);
  return wrapGeoProxy(serverUrl + joinchar + WPS.getDescrProcString(layerIdentifier));
};

WPS.unwrapServer = function(url) {
  return WPS.stripReq(decodeURIComponent(unwrapGeoProxy(url)));
};

WPS.stripDescProc = function(serverUrl, layerIdentifier) {
  return serverUrl.replace(WPS.getDescrProcString(layerIdentifier), '').slice(0, -1);  // slice strips last char
};

WPS.unwrapProcServer = function(url, layerIdentifier) {
  return WPS.stripDescProc(decodeURIComponent(unwrapGeoProxy(url)), layerIdentifier);
};

WFS.unwrapServer = function(url) {
  return WFS.stripReq(decodeURIComponent(unwrapGeoProxy(url)));
};

WCS.unwrapServer = function(url) {
  return WCS.stripReq(decodeURIComponent(unwrapGeoProxy(url)));
};

WMS.unwrapServer = function(url) {
  return WMS.stripReq(decodeURIComponent(unwrapGeoProxy(url)));
};


unwrapServer = function(url, format)
{
  if(format === 'WFSCapabilities')     { return WFS.unwrapServer(url); }
  if(format === 'WMSCapabilities')     { return WMS.unwrapServer(url); }
  if(format === 'WCSCapabilities')     { return WCS.unwrapServer(url); }
  if(format === 'WCSDescribeCoverage') { return WCS.unwrapServer(url); }

  return "Unknown Format!!";
};


getService = function(format)
{
  if(format === 'WFSCapabilities')     { return "WFS"; }
  if(format === 'WMSCapabilities')     { return "WMS"; }
  if(format === 'WCSCapabilities')     { return "WCS"; }
  if(format === 'WCSDescribeCoverage') { return "WCSdc"; }

  return "Unknown Service!!";
};


isPrimaryService = function(service)
{
  return (service === 'WMS' || service === 'WFS' || service === 'WCS');
};

