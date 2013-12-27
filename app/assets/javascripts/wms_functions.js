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
    // Here, "this" is the WXSGetCapabilitiesReader
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


// Probe a WMS and detect which layers are available
WMS.updateLayerList = function(serverUrl, successFunction, failureFunction) {
  jQuery('.form_error_message').text("");    // Clear all error messages
  jQuery('#layers_loading_indicator').show();

  var fullUrl = WMS.getCapReq(serverUrl);

  var store = new GeoExt.data.WMSCapabilitiesStore({ url: fullUrl });

  COMMON.updateLayerList(store, successFunction, failureFunction);
};



// Probe a WFS and detect which layers are available
WFS.updateLayerList = function(serverUrl, successFunction, failureFunction) {
  var fullUrl = WFS.getCapReq(serverUrl);     // These are the fields we want from the WFS... note the addition of srs to the default list!
  var store = new GeoExt.data.WFSCapabilitiesStore({ url: fullUrl, fields: [ { name: "name",               type: "string" },
                                                                             { name: "title",              type: "string" },
                                                                             { name: "namespace",          type: "string", mapping: "featureNS" },
                                                                             { name: "abstract",           type: "string" },
                                                                             { name: "srs",                type: "string" },
                                                                             { name: "latLongBoundingBox", type: "string" }
                                                                        ] });
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
// WPS.version = '1.0.0';

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

