
var hideUnregisterAndFriends = function() {
  $('.invisible-cell').hide();
};


 var showDetails = function() {
  $('.technical-details').show(); 
  $('.show-details').click(function(){ hideDetails(); });
  $('.show-details').html('<<< Hide details');
};

var hideDetails = function() {
  $('.technical-details').hide();
  $('.show-details').click(function(){ showDetails(); });
  $('.show-details').html('Show details >>>');
};


var layerRecords       = {};
var layerStores        = {};
var serverResponseList = {};


var processedUrls   = {};


// Call this before starting a new round of probeServer
var resetProbe = function() 
{
  processedUrls = {};
};



var Datasets = {};

// This function will be called for every dataset registered with the current city.  Many will have the same
// server.  Avoid processing the same server twice.
// Called from renderTable(), which is called from onCityChange() event handler
// For service, specify WFS, WMS, WCS, or ALL.  ALL is the default if this paremeter is not supplied.
var probeDataServer = function(url, service)
{

  var updateDatasets = function(serverUrl, dataProxy, records, service)  // service will be WMS, WFS, or WCS
  {
    
    for(var i = 0, count = records.length; i < count; i++) {
      var record = records[i];

      var identifier = record.data.name;
      var serverUrl  = serverUrl;
      var title      = record.data.title;
      var descr      = record.data["abstract"] || title;   
      var datasetId  = registeredDatasets[serverUrl][identifier];


      if(!Datasets[datasetId]) {
        Datasets[datasetId] = { 
          identifier:      identifier,
          serverUrl:       serverUrl,
          key:             datasetId,
          title:           "",
          descr:           "",
          nameCameFromWms: false,
          services:        []
        };
      }

      var dataset = Datasets[datasetId];

      dataset[service] = {};
      dataset.services.push(service);

      // Treat WMS as definitive -- if we have that, don't overwrite dataset attributes
      if(!dataset.nameCameFromWms) {
        dataset.title   = title;
        dataset.descr   = descr;
        nameCameFromWms = (service == 'WMS');
      }
    }
  };

  // Server has responded to our query and seems happy (from updateLayerList)
  // Explanation of args: http://docs.sencha.com/ext-js/3-4/#!/api/Ext.data.DataProxy-event-load
  var onGetCapabilitiesSucceeded = function(dataProxy, records, options)
  {
    var format    = dataProxy.format.name;
    var serverUrl = unwrapServer(dataProxy.url, format);
    var service   = getService(format);

    serverResponseList[serverUrl][service] = new ServerResponse(true, dataProxy, records, service);
    updateDatasets(serverUrl, dataProxy, records, service);

    gotServerResponse(serverUrl, serverResponseList[serverUrl]);
  };


  // We pepper each server with WMS, WFS, and WCS requests.  One of these has failed, 
  // which might be bad, or it might be perfectly fine.  It might mean that the server 
  // is down, or that it has not been configured to respond to a particular service.

  // Explanation of args: http://docs.sencha.com/ext-js/3-4/#!/api/Ext.data.DataProxy-event-exception
  var onGetCapabilitiesFailed = function(dataProxy, type, action, options, response, arg) 
  {
    // status.responseText has response from data server?
    // We might get here if server the server does not support service WxS

    var format    = options.reader.meta.format.name;
    var serverUrl = unwrapServer(dataProxy.url, format);
    var service   = getService(format);

    serverResponseList[serverUrl][service] = new ServerResponse(false, null, [], service, 
                                                             response.status, response.responseText);
    gotServerResponse(serverUrl, serverResponseList[serverUrl]);
  };



  var s = service || "ALL";

  // Protect against pinging the same server mulitple times
  if(processedUrls[url]) 
    return;

  processedUrls[url] = true;

  serverResponseList[url] = {};    

  if(s === 'ALL' || s === 'WMS')
    WMS.updateLayerList(url, onGetCapabilitiesSucceeded, onGetCapabilitiesFailed);

  if(s === 'ALL' || s === 'WFS')
    WFS.updateLayerList(url, onGetCapabilitiesSucceeded, onGetCapabilitiesFailed);

  if(s === 'ALL' || s === 'WCS')
    WCS.updateLayerList(url, onGetCapabilitiesSucceeded, onGetCapabilitiesFailed);  // Note this will generate TWO responses!
};



var getTagPickerControlId = function(datasetIdentifier)
{
  return 'data-type-' + datasetIdentifier;
};


var tagPickerChanged = function(ctrl)
{
  ctrl.blur();    // For firefox?

  if(ctrl.val() === 'Ignore This') 
    return; 

  addTag(ctrl);
};


var getLayerNameFromDataTypeId = function(ctrl)
{
  return ctrl.attr('id').substring('data_type_'.length); // Remove 'data_type_' from the front of the string
};


// If readyToPoulate is false, we can pass in anything for layer as long as it has an identifier property
var makeTagPickerControl = function(layer, controlId, enabled)
{
  return '<span class="loading-indicator tag-list-loading-indicator">Loading&nbsp;tags...</span>' +
            '<select style="float:right" class="add-tag-dropdown-control hidden" ' + 
              'data-serverurl="' + layer.serverUrl + '" ' +   // These keys seem to get lowercased anyway... so no upper case letter pls!
              'data-datasetidentifier="' + layer.identifier + '" ' +
              'id="' + controlId + '" ' + (enabled ? '' : 'disabled="true" ') +
              'onchange="tagPickerChanged($(this));">' +
           '<option value = "Ignore This">Add Tag:</option>' + 
         '</select>';
};

// Helper function for makeTagPickerControl()
var addWmsOptionToDropdown = function(controlId) {
  $('#' + controlId).find(">:first-child").after('<option>Mapping</option>');   // We want this to be the second choice
};


// Helper function for makeTagPickerControl()
var addWfsWcsOptionsToDropdown = function(controlId) {
  for(var j = 0, jlen = DataTagList.length; j < jlen; j++) 
    $('#' + controlId).append('<option value="' + DataTagList[j].id + '">' + DataTagList[j].id + '</option>');
};


// Create a popup info display for this dataset 
var renderInfoPopup = function(dataset) 
{
  var serverUrlId = registeredDataAndMapServers[dataset.server_url];

  var urlId = cssEscape(dataset.serverUrl + dataset.identifier);

  return '<div class="infotable" id="infotable-' + dataset.id + '">' +
            '<div class="close"></div>' +
            '<h1><span class="dataset-title-' + dataset.id + '"></h1>' +
            '<div class="dataset-descr-' + dataset.id + '"></div>' +
            '<div style="overflow:hidden"><dl>' +
              '<dt>Server Name:</dt><dd class="server-name-' + serverUrlId + '"></dd>' +
               '<dt>Data Services:</dt><dd id="results-' + dataset.id + '">Waiting for response from server...</dd>' + 
               '<dt>Tags:</dt><dd><span class="taglist-' + urlId + '"></span>' +
                '<span>' + makeTagPickerControl(dataset, getTagPickerControlId(dataset.id), true) + '</span></dd>' +
            '</dl></div>' +
            '<div style="overflow:hidden" class="technical-details">' +
              '<div class="technical-details-header">Technical Details</div><dl>' +
              '<dt>Server Base URL:</dt><dd>' + dataset.server_url + '</dd>' +
              '<dt>Dataset Identifier:</dt><dd>' + dataset.identifier + '</dd>' +
              '<dt>All Get Capabilities Links:</dt><dd>' +
                  '<a href="' + WFS.getCapUrl(dataset.server_url) + '" target="_blank">WFS</a> ' +
                  '<a href="' + WMS.getCapUrl(dataset.server_url) + '" target="_blank">WMS</a> ' +
                  '<a href="' + WCS.getCapUrl(dataset.server_url) + '" target="_blank">WCS</a>' +
              '</dd>' +
              '<dt>Projections Available:</dt><dd>' + '' + '</dd>' + 
              '<dt>Bounding Box:</dt><dd>' + '' + '</dd>' + 
              '<dt>Attribute Columns:</dt><dd>' + '' + '</dd>' + 
            '</dl></div>' +
            '<div><a href="javascript:void(0);" class="show-details"></a></div>' +
         '</div>';
};


var dataDiscoveryComplete = false;
var DataTagList = [];

// For each url in our database, start probing the server
var collectTags = function (wpsServerUrlList) 
{
  for(var i = 0, len = wpsServerUrlList.length; i < len; i++)
    WPS.probeWPS_getDataTypes(wpsServerUrlList[i]);
};


// Class that describes response from server, either success or failure
var ServerResponse = function(success, dataProxy, records, service, responseCode, responseText) 
{
  this.success = success;
  this.records = records;
  this.service = service;
  this.errCode = responseCode || null;
  this.errText = responseText || null;

  if(success) { 

    var obj = dataProxy.reader.raw;

    if(service === "WMS") {
      // These work for both 1.1.1 and 1.3.0
      this.serverName  = obj.service.title       || obj.service.name || "Map Server";
      this.serverDescr = obj.service["abstract"] || this.serverName;
    }
    else if(service === "WFS") {
      // These work for both 1.0.0 and 1.1.0
      this.serverName  = obj.service.name  || "Web Feature Server";
      this.serverDescr = obj.service.title || this.serverName;
    }
    else if(service === "WCS") {
      // These work for both 1.0.0 and 1.1.0
      this.serverName  = obj.serviceIdentification.title       || "Web Coverage Server";
      this.serverDescr = obj.serviceIdentification["abstract"] || this.serverName;
    }
  }
  else {
    this.serverName  = this.serverName  || "";
    this.serverDescr = this.serverDescr || "";
  }
};


// Get the proper getCaps URL for this server and service
var getGetCapUrl = function(serverUrl, service)
{
  if     (service == 'WMS') { return WMS.getCapUrl(serverUrl); }
  else if(service == 'WFS') { return WFS.getCapUrl(serverUrl); }
  else if(service == 'WCS') { return WCS.getCapUrl(serverUrl); }
};


// Take an array or comma-separated list of tags and format them into some presentation quality HTML
var createTagList = function(taglist, deleteable, serverUrl, datasetIdentifier) 
{
    if(typeof(taglist) === 'string')
      taglist = taglist.split(',');

    var delBtn = '';

    if(deleteable)
      delBtn = '<span class="tag-deletable" data-url="' + serverUrl + '" ' +
               'data-identifier="' + datasetIdentifier + '"></span>';

    var list = "";
    var strings = typeof(taglist[0]) === 'string';

    for(var i = 0, len = taglist.length; i < len; i++) 
      list += '<span class="tag">' + delBtn +
                (strings ? taglist[i] : taglist[i].tag) + '</span> ';  // <== space needed

   return list; 
};


var updateTags = function(serverUrl, datasetIdentifier, tags)
{
  var id = cssEscape(serverUrl + datasetIdentifier);

  $('.taglist-' + id).html(tags.length > 0 ? createTagList(tags, true, serverUrl, datasetIdentifier) : 'None');
  addDeleteTagClickHander();    // Need to readd a handler for these new tags
};


var addDeleteTagClickHander = function() 
{
  // Add a handler to delete tags when clicked on
  $('.tag-deletable').click(function() {
    var serverUrl         = $(this).data('url');
    var datasetIdentifier = $(this).data('identifier');
    var tagVal            = $(this).parent().text();

    if(confirmDeleteTag(serverUrl, datasetIdentifier, tagVal))
      deleteTag(serverUrl, datasetIdentifier, tagVal);
  });
};


var confirmDeleteTag = function(serverUrl, datasetIdentifier, tagVal) 
{
  if(TagIsInUse[tagVal] && TagIsInUse[tagVal][cssEscape(serverUrl + datasetIdentifier)] > 0) {
    var ct = TagIsInUse[tagVal][cssEscape(serverUrl + datasetIdentifier)];
    var c  = (ct == 1) ? "configuration" : "configurations";
    var t  = (ct == 1) ? "this"          : "these";
    var th = (ct == 1) ? "it"            : "them";

    return confirm("This dataset is in use by " + ct + " " + c + ". " +
                   "Changing its type will cause it to be removed from " + t + " " + c + ".\n\n" +
                   "Click OK if you are sure you want to change the type of this dataset.");
  }
  // else...
  return true;
};



