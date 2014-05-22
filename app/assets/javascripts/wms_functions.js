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
var CRS = CRS || { };

var COMMON = COMMON || { };


// XXX.getCapabilities only called from startProbing() on our ServiceProbe objects
// Probe a WPS and detect which services are available
WPS.getCapabilities = function(serverUrl, successFunction) {
  OpenLayers.Request.GET({
    url: serverUrl,
    params: {     // These will be appeneded to the URL in the form SERVICE=WPS etc.
      "SERVICE": "WPS",
      "REQUEST": "GetCapabilities",
      "VERSION": WPS.version
    },
    success: function(response){
      try {
        capabilities = new OpenLayers.Format.WPSCapabilities().read(response.responseText);
      }
      catch(error) {
        capabilities = undefined;
      }
      successFunction(capabilities, response);
    },
    failure: function(response) {
      successFunction(undefined, response);
    }
  });
};


WPS.describeProcess = function(serverUrl, successFunction) {
  OpenLayers.Request.GET({
    url: serverUrl,
    params: {     // These will be appeneded to the URL in the form SERVICE=WPS etc.
      "SERVICE":    "WPS",
      "REQUEST":    "DescribeProcess",
      "IDENTIFIER": "ALL",
      "VERSION":    WPS.version
    },
    success: function(response){
      try {
        capabilities = new OpenLayers.Format.WPSDescribeProcess().read(response.responseText);
      }
      catch(error) {
        capabilities = undefined;
      }
      successFunction(capabilities, response);
    },
    failure: function(response) {
      successFunction(undefined, response);
    }
  });
};



WMS.getCapabilities = function(serverUrl, successFunction) {
  OpenLayers.Request.GET({
    url: serverUrl,
    params: {     // These will be appeneded to the URL in the form SERVICE=WMS etc.
      "SERVICE": "WMS",
      "REQUEST": "GetCapabilities",
      "VERSION": WMS.version
    },
    success: function(response) {
      try {
        capabilities = new OpenLayers.Format.WMSCapabilities().read(response.responseText);
      }
      catch(error) {
        capabilities = undefined;
      }
      successFunction(capabilities, response);
    },
    failure: function(response) {
      successFunction(undefined, response);
    }
  });
};

WFS.getCapabilities = function(serverUrl, successFunction) {
  OpenLayers.Request.GET({
    url: serverUrl,
    params: {     // These will be appeneded to the URL in the form SERVICE=WFS etc.
      "SERVICE": "WFS",
      "REQUEST": "GetCapabilities",
      "VERSION": WFS.version
    },
    success: function(response) {
      try {
        capabilities = new OpenLayers.Format.WFSCapabilities().read(response.responseText);
      }
      catch(error) {
        capabilities = undefined;
      }
      successFunction(capabilities, response);
    },
    failure: function(response) {
      successFunction(undefined, response);
    }
  });
};


// For WCS, we need to do both a GetCapabilities and a DescribeCoverage to get all the info we need.  Lame but true.
WCS.getCapabilities = function(serverUrl, successFunction) {
  OpenLayers.Request.GET({
    url: serverUrl,
    params: {     // These will be appeneded to the URL in the form SERVICE=WCS etc.
      "SERVICE": "WCS",
      "REQUEST": "GetCapabilities",
      "VERSION": WCS.version
    },

    // Note that sometimes, the lamer servers out there will send a WFS document to us.  We need to 
    // filter this lameness out.
    success: function(response) {
      try {
        var capabilities = new OpenLayers.Format.WCSCapabilities().read(response.responseText);
      }
      catch(error) {
        var capabilities = undefined;
      }

      successFunction(capabilities, response);
    },
    failure: function(response) {
      successFunction(undefined, response);
    }
  });


  OpenLayers.Request.GET({
    url: serverUrl,
    params: {     // These will be appeneded to the URL in the form SERVICE=WCS etc.
      "SERVICE": "WCS",
      "REQUEST": "DescribeCoverage",
      "VERSION": WCS.version
    },
    success: function(response) {
      try {
        var capabilities = new OpenLayers.Format.WCSDescribeCoverage().read(response.responseText);
      }
      catch(error) {
        var capabilities = undefined;
      }

      successFunction(capabilities, response);
    },
    failure: function(response) {
      successFunction(undefined, response);
    }
  });
};


// // Probe a WMS and detect which services are available
// WMS.getCapabilities = function(serverUrl, successFunction, failureFunction) {
//   jQuery("#wms-failure-message").text("");    // Clear all error messages

//   var fullUrl = WMS.getCapReq(serverUrl);

//   var store = new GeoExt.data.WMSCapabilitiesStore({ url: fullUrl });

//   COMMON.getCapabilities(store, successFunction, failureFunction);
// };



// Probe a WFS and detect which services are available
// WFS.getCapabilities = function(serverUrl, successFunction, failureFunction) {
//   var fullUrl = WFS.getCapReq(serverUrl);     // These are the fields we want from the WFS... note the addition of srs to the default list!
//   var store = new GeoExt.data.WFSCapabilitiesStore({ url: fullUrl, fields: [ { name: "name",               type: "string" },
//                                                                              { name: "title",              type: "string" },
//                                                                              { name: "namespace",          type: "string", mapping: "featureNS" },
//                                                                              { name: "abstract",           type: "string" },
//                                                                              { name: "srs",                type: "string" },
//                                                                              { name: "latLongBoundingBox", type: "string" }
//                                                                         ] });
//   COMMON.getCapabilities(store, successFunction, failureFunction);
// };


// // Probe a WCS and detect which services are available.  Need two calls to get all the required info.  Lame.
// WCS.getCapabilities = function(serverUrl, successFunction, failureFunction) {
//   var fullUrl, store;

//   fullUrl = WCS.getCapReq(serverUrl);
//   store = new GeoExt.data.WCSCapabilitiesStore({ url: fullUrl });
//   COMMON.getCapabilities(store, successFunction, failureFunction);

//   fullUrl = WCS.descCovReq(serverUrl);
//   store = new GeoExt.data.WCSDescribeCoverageStore({ url: fullUrl });
//   COMMON.getCapabilities(store, successFunction, failureFunction);
// };


// // Helper for WFS, WMS, and WCS.getCapabilities 
// COMMON.getCapabilities = function(store, successFunction, failureFunction) {
//   // Add some callbacks to handle various situations
//   store.on('load',      successFunction);
//   store.on('exception', failureFunction);
//   store.load();
// }


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
WMS.version = '1.1.0';    // Christian says 1.3.0 is "weird", Rotterdam wms doesn't like 1.3.0!
WFS.version = '1.0.0';    // Montreuil only works with 1.0.0
WCS.version = '1.1.0';    // Rotterdam only works when this is set to 1.1.0
WPS.version = '1.0.0';

//http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/LB_localOWS_test.map&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities
//http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities


////////////////////////////////////////
// WPS functions
WPS.getCapStr = "SERVICE=WPS&VERSION=" + WPS.version + "&REQUEST=GetCapabilities";


WPS.getCapUrl = function(serverUrl) {
  var joinchar = getJoinChar(serverUrl);
  return serverUrl + joinchar + WPS.getCapStr;
};

WPS.getCapReq = function(serverUrl) {
  return wrapGeoProxy(WPS.getCapUrl(serverUrl));
};

WPS.stripReq = function(serverUrl) {
  return serverUrl.replace(WPS.getCapStr, '').slice(0, -1);   // slice strips last char
};

WPS.unwrapServer = function(url) {
  return WPS.stripReq(decodeURIComponent(unwrapGeoProxy(url)));
};



////////////////////////////////////////
// WMS functions
WMS.getCapStr = "SERVICE=WMS&VERSION=" + WMS.version + "&REQUEST=GetCapabilities";

WMS.getCapUrl = function(serverUrl) {
  var joinchar = getJoinChar(serverUrl);
  return serverUrl + joinchar + WMS.getCapStr;
};

WMS.getCapReq = function(serverUrl) {
  return wrapGeoProxy(WMS.getCapUrl(serverUrl));
};

// WMS.stripReq = function(serverUrl) {
//   return serverUrl.replace(WMS.getCapStr, '').slice(0, -1);   // slice strips last char
// };

// WMS.unwrapServer = function(url) {
//   return WMS.stripReq(decodeURIComponent(unwrapGeoProxy(url)));
// };



////////////////////////////////////////
// WFS functions
// http://www.mail-archive.com/users@geoext.org/msg01843.html
// WFS.getCapStr = "SERVICE=WFS&VERSION=" + WFS.version + "&REQUEST=GetCapabilities";    

// WFS.getCapUrl = function(serverUrl) {
//   var joinchar = getJoinChar(serverUrl);
//   return serverUrl + joinchar + WFS.getCapStr;
// };

// WFS.getCapReq = function(serverUrl) {
//   return wrapGeoProxy(WFS.getCapUrl(serverUrl));
// };

// WFS.stripReq = function(serverUrl) {
//   return serverUrl.replace(WFS.getCapStr, '').slice(0, -1);   // slice strips last char
// };

// WFS.unwrapServer = function(url) {
//   return WFS.stripReq(decodeURIComponent(unwrapGeoProxy(url)));
// };


////////////////////////////////////////
// WCS functions
// http://www.mail-archive.com/users@geoext.org/msg01843.html
// WCS.getCapStr = "SERVICE=WCS&VERSION=" + WCS.version + "&REQUEST=GetCapabilities";   
// WCS.descCovStr = 'SERVICE=WCS&VERSION=' + WCS.version + '&REQUEST=DescribeCoverage';   

// WCS.getCapUrl = function(serverUrl) {
//   var joinchar = getJoinChar(serverUrl);
//   return serverUrl + joinchar + WCS.getCapStr;
// };

// WCS.descCovUrl = function(serverUrl) {
//   var joinchar = getJoinChar(serverUrl);
//   return serverUrl + joinchar + WCS.descCovStr;
// }

// WCS.getCapReq = function(serverUrl) {
//   return wrapGeoProxy(WCS.getCapUrl(serverUrl));
// };

// WCS.stripReq = function(serverUrl) {
//   return serverUrl.replace(WCS.getCapStr, '').replace(WCS.descCovStr, '').slice(0, -1);   // slice strips last char
// };

// WCS.descCovReq = function(serverUrl) {
//   return wrapGeoProxy(WCS.descCovUrl(serverUrl));
// }

// WCS.unwrapServer = function(url) {
//   return WCS.stripReq(decodeURIComponent(unwrapGeoProxy(url)));
// };

////////////////////////////////////////


// var unwrapServer = function(url, format)
// {
//   if(format == "WPSCapabilities")     { return WPS.unwrapServer(url); }
//   if(format == "WFSCapabilities")     { return WFS.unwrapServer(url); }
//   if(format == "WMSCapabilities")     { return WMS.unwrapServer(url); }
//   if(format == "WCSCapabilities")     { return WCS.unwrapServer(url); }
//   if(format == "WCSDescribeCoverage") { return WCS.unwrapServer(url); }

//   return "Unknown Format!!";
// };


////////////////////////////////////////


// Break crs into tokens for comparison or reconstitution
CRS.splitCrsIntoWords = function(crs)
{
  // First, replace the :: with a single :
  crsFixed  = crs.replace('::', ':');

  // Now split on a ':', lowercasing to remove case considerations, so we can compare the last two tokens
  return crsFixed.split(':');
};


// Convert:
//  1) urn:ogc:def:crs:EPSG::28992 ==> EPSG:28992
//  2) EPSG:28992                  ==> EPSG:28992
//  3) 28992                       ==> ESPG:28992
CRS.getSimpleFormat = function(crs)
{
  crsWords = CRS.splitCrsIntoWords(crs);
  
  // Handle case 3
  if(crsWords.length == 1)
    return "EPSG:" + crsWords[0];

  return crsWords[crsWords.length - 2] + ':' + crsWords[crsWords.length - 1];
};


// Compare whether two crs's are in fact the same.  We'll consider all of the following two strings:
// A) urn:ogc:def:crs:EPSG::28992
// B) EPSG:28992
// C) 28992
CRS.isEqual = function(first, second)
{
  if(first === second)
    return true;

  // Normalize first and second by converting to a common format
  firstSimple  = CRS.getSimpleFormat(first);
  secondSimple = CRS.getSimpleFormat(second);

  return firstSimple === secondSimple;
};


CRS.hasCRS = function(crsList, crs)
{
  if(typeof(crsList) === "string")
    return CRS.isEqual(crsList, crs);

  if(!crsList || !crs)
    return false;

  var i = 0, c;
  while(c = crsList[i]) {
      if(CRS.isEqual(c, crs)) 
        return true;
      i++;
  }
    
  return false;
};