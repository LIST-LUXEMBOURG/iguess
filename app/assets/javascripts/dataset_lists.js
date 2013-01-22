  

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


  var layerRecords    = { };
  var layerStores     = { };
  var serverResponses = { };


  // We've got a new batch of datasets to display!
  // Note that for the status div, all rows from the same server share the same class.  Each has a unique id.
  var renderTable = function(datasets) {

    $('#dataset-list').empty();    // Clear table

    for(var i = 0; i < datasets.length; i++) {
      var dataset = datasets[i];

      var railsId = railsIdLookup[makeKey(dataset.server_url, dataset.identifier)];
      $('#dataset-list').append(renderTableRow(dataset, railsId));

      $('#infotables').append(renderInfoTable(dataset, railsId));

      processUrl(dataset.server_url);
    }

    $('img[rel]').overlay();                            // Set up the layer info overlays
    $('img[rel]').click(function(){ hideDetails(); });   // Close details panel on open

    $('.show-details').click(function(){ showDetails(); });


          // Make sure table is sorted
      // var sorting = [[1,0], [0,0]]; 
      // // sort on the first column 

      // $('#sortable_table').trigger("update"); 
      // $('#sortable_table').trigger("sorton",[sorting]); 
  }; 


  var processedUrls   = [ ];

  var processUrl = function(url)
  {
    // This function will be called for every dataset registered with the current city.  Many will have the same
    // server.  Avoid processing the same server twice.
    // Called from renderTable(), which is called from onCityChange() event handler
    if(processedUrls.hasObject(url)) {  /*setLayerStatus(url);*/ return;  }

    processedUrls.push(url);

    serverResponses[url] = { };    

    WMS.updateLayerList(url, onGetCapabilitiesSucceeded, onGetCapabilitiesFailed);
    WFS.updateLayerList(url, onGetCapabilitiesSucceeded, onGetCapabilitiesFailed);
    WCS.updateLayerList(url, onGetCapabilitiesSucceeded, onGetCapabilitiesFailed);
  };


  // Server has responded to our query and seems happy (from updateLayerList)
  // Explanation of args: http://docs.sencha.com/ext-js/3-4/#!/api/Ext.data.DataProxy-event-load
  var onGetCapabilitiesSucceeded = function(dataProxy, records, options) // Need to validate each item in dataProxy
  {
    var format  = dataProxy.format.name;
    var url     = unwrapServer(dataProxy.url, format);
    var service = getService(format);


// if(url==='http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map') debugger

    serverResponses[url][service] = new ServerResponse(true, dataProxy, records, service);
    updateDatasets(dataProxy, records, service);
                                                  
    setLayerStatus(url);
  };


  // We pepper each server with WMS, WFS, and WCS requests.  One of these has failed, 
  // which might be bad, or it might be perfectly fine.  It might mean that the server 
  // is down, or that it has not been configured to respond to a particular service.

  // Explanation of args: http://docs.sencha.com/ext-js/3-4/#!/api/Ext.data.DataProxy-event-exception
  var onGetCapabilitiesFailed = function(dataProxy, type, action, options, response, arg) 
  {
    // status.responseText has response from data server?
    // We might get here if server the server does not support service WxS

    var format  = options.reader.meta.format.name;
    var url     = unwrapServer(dataProxy.url, format);
    var service = getService(format);

    // alert("server " + dataProxy.url + " had no " + service + " service");

    serverResponses[url][service] = new ServerResponse(false, null, [], service, 
                                                  response.status, response.responseText);

    setLayerStatus(url);
  };


  var Datasets = {};

  var updateDatasets = function(dataProxy, records, service)  // service will be WMS, WFS, or WCS
  {
    for(var i = 0, count = records.length; i < count; i++) {
      var record = records[i];

      var identifier = record.data.name;
      var title      = record.data.title;
      var descr      = record.data["abstract"] || title;    


      if(!Datasets[identifier]) {
        Datasets[identifier] = { 
          identifier: identifier,
          title: "",
          descr: "",
          nameCameFromWms: false,
          services: []
        };
      }

      var dataset = Datasets[identifier];

      dataset[service] = {};
      dataset.services.push(service);

      // Treat WMS as definitive -- if we have that, don't overwrite dataset attributes
      if(!dataset.nameCameFromWms) {
        dataset.title   = title;
        dataset.descr   = descr;
        nameCameFromWms = (service == WMS);
      }
    }
  };


  // Create a popup info display for this dataset 
  var renderInfoTable = function(dataset, railsId) 
  {
    var serverUrlId = serverUrlIdLookup[dataset.server_url];

    return '<div class="infotable" id="infotable-' + railsId + '">' +
              '<div class="close"></div>' +
              '<h1><span class="dataset-name2-' + railsId + '"></h1>' +
              '<div class="dataset-descr-' + railsId + '"></div>' +
              '<div style="overflow:hidden"><dl>' +
                '<dt>Server Name:</dt><dd class="server-name-' + serverUrlId + '"></dd>' +
                 '<dt>Data Services:</dt><dd id="results-' + railsId + '">Waiting for response from server...</dd>' + 
                 
              '</dl></div>' +
              '<div style="overflow:hidden" class="technical-details">' +
                '<div class="section-header">Technical Details</div><dl>' +
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
              '<div><a href="#" class="show-details"></a></div>' +
           '</div>';
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
        this.serverName  = obj.service.title || obj.service.name || "Map Server";
        this.serverDescr = obj.service["abstract"] || this.serverName;
      }
      else if(service === "WFS") {
        // These work for both 1.0.0 and 1.1.0
        this.serverName  = obj.service.name || "Web Feature Server";
        this.serverDescr = obj.service.title || this.serverName;
      }
      else if(service === "WCS") {
        // These work for both 1.0.0 and 1.1.0
        this.serverName  = obj.serviceIdentification.title || "Web Coverage Server";
        this.serverDescr = obj.serviceIdentification["abstract"] || this.serverName;
      }
    }
    else {
      this.serverName  = this.serverName  || "";
      this.serverDescr = this.serverDescr || "";
    }
  };


  // We have a response of some sort from serverUrl -- update the datasets table to show it.
  // serverResponses should be an object with a ServerResponse object for WFS, WMS, and WCS.
  var setLayerStatus = function(serverUrl)
  {
    var serverResponseArry = serverResponses[serverUrl];
    var serverUrlId        = serverUrlIdLookup[serverUrl]; 

    // Wait until we've heard back from all servers: wfs, wms, and wcs
    if(!!!serverResponseArry.WMS || !!!serverResponseArry.WFS || !!!serverResponseArry.WCS) { return; } 


    // Prioritize WMS response, if any
    var serverName  = serverResponseArry.WMS.serverName  || serverResponseArry.WFS.serverName  || serverResponseArry.WCS.serverName;
    var serverDescr = serverResponseArry.WMS.serverDescr || serverResponseArry.WFS.serverDescr || serverResponseArry.WCS.serverDescr;

    if(serverName) {
      $('.server-name-'  + serverUrlId).html(serverName);
      $('.server-descr-' + serverUrlId).html(serverDescr || serverName);
    }

    if(!(serverResponseArry.WMS.success || serverResponseArry.WFS.success || serverResponseArry.WCS.success)) {    
      // All services failed, all datasets from this server ganz kaput
      $('.status-' + serverUrlId).html('<img class="status-indicator" src="/assets/server_responding_no.png" alt="WMS server not responding">');
      $('.dataset-name-' + serverUrlId).text("Unknown");
      return;
    }


    // At least one server succeeded, vist each one-by-one

    var ids = serverDatasets[serverUrl];   // List of registered datasets available on this server

    for(var i = 0, recs = ids.length; i < recs; i++) {
      var dataset = Datasets[ids[i]];
      if(!!!dataset) {
        layerMissing(serverUrl, ids[i])
        return;
      }

      updateLayerInfo(serverUrl, ids[i], dataset.title.replace(/ /g,'&nbsp;'), dataset.descr, dataset.services);
    }
  };


      // for(var j = 0; j < 3 && !found; j++) {
      //   services.push(serverResponseArry[j].service);

      //   for(var k = 0, records = serverResponseArry[j].records.length; k < records; k++) {
      //     var record = serverResponseArry[j].records[k];

      //     var identifier = record.get("name");

      //     if(datasets[i] == identifier) {
      //       var title = record.get("title") || record.get("name");
      //       title = title.replace(/ /g,'&nbsp;');

      //       updateLayerInfo(serverUrl, identifier, true, title, record.get("abstract"), services);

      //       found = true;
      //       break;
      //     }
      //   }
      // }

      // if(!found) {
      //   updateLayerInfo(serverUrl, datasets[i], false, datasets[i], 
      //     'This dataset could no longer be located on the data server',    // Descr
      //     [ ]);                                                            // Services
      // }


  // var updateLayerInfo = function(serverUrl, identifier, available, name, descr, services) 
  // {

  //   var railsId = railsIdLookup[makeKey(serverUrl, identifier)];

  //   // Servers will have both registered and unregistered datasets.  If the railsId is not defined, that means this is not a 
  //   // retistered dataset, and there will be no layerInfo to update.
  //   if(!!!railsId)
  //     return;

  //   $('.dataset-name2-' + railsId).html(name);    // Appears in the name column, also on infotable popup
  //   $('.dataset-descr-' + railsId).html(descr);
  //   $('#results-'       + railsId).html('');      // Clear

  //   // Provide service link for whatever services
  //   var currentHtml = $('#results-' + railsId).html;
  //   $('#results-' + railsId).html('<a href="' + getGetCapUrl(serverUrl, service) + '" target="_blank">' + service + '</a>&nbsp;') + currentHtml;
  //   if(currentHtml === '') {
  //     $('#results-' + railsId).append('&nbsp;(Right-click, Copy Link Location)');
  //   }

  //   if(available) {
  //     $('.status2-' + railsId).html('<img class="status-indicator" src="/assets/layer_available_yes.png" alt="Layer available">');
  //   } else {
  //     $('.status2-' + railsId).html('<img class="status-indicator" src="/assets/layer_available_no.png" alt="Layer not available">');
  //   }
  // }


  var updateLayerInfo = function(serverUrl, dataset, name, descr, services) 
  {
    var railsId = railsIdLookup[makeKey(serverUrl, dataset)];
    $('.dataset-name2-' + railsId).html(name);    // Appears in the name column, also on infotable popup
    $('.dataset-descr-' + railsId).html(descr);
    $('#results-'       + railsId).html('');      // Clear
    var url = '';
    // Parse services... provide links for whatever services
    for (var i = 0; i < services.length; i++) {
      url = getGetCapUrl(serverUrl, services[i]);
      $('#results-' + railsId).append('<a href="' + url + '" target="_blank">' + services[i] + '</a>&nbsp;');
    }
    if(url !== '') {
      $('#results-' + railsId).append('&nbsp;(Right-click, Copy Link Location)');
    }
    $('.status2-' + railsId).html('<img class="status-indicator" src="/assets/layer_available_yes.png" alt="Layer available">');
  };

  var layerMissing = function(serverUrl, dataset)
  {
    var railsId = railsIdLookup[makeKey(serverUrl, dataset)];

    $('.dataset-name2-' + railsId).html('Missing');   // Appears in the name column, also on infotable popup
    $('.dataset-descr-' + railsId).html('This dataset appears to have been removed from the server');
    $('#results-'       + railsId).html('');          // Clear
    $('.status2-' + railsId).html('<img class="status-indicator" src="/assets/layer_available_no.png" alt="Layer not available">');
  };


  // Get the proper getCaps URL for this server and service
  var getGetCapUrl = function(serverUrl, service)
  {
    if     (service == 'WMS') { return WMS.getCapUrl(serverUrl); }
    else if(service == 'WFS') { return WFS.getCapUrl(serverUrl); }
    else if(service == 'WCS') { return WCS.getCapUrl(serverUrl); }
  };
