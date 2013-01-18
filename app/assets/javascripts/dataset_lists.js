  

  var hideUnregisterAndFriends = function() {
    $('.invisible-cell').hide();
  }


   var showDetails = function() {
    $('.technical-details').show(); 
    $('.show-details').click(function(){ hideDetails(); });
    $('.show-details').html('<<< Hide details');
  }

  var hideDetails = function() {
    $('.technical-details').hide();
    $('.show-details').click(function(){ showDetails(); });
    $('.show-details').html('Show details >>>');
  }


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
    $('img[rel]').click(function(){ hideDetails() });   // Close details panel on open

    $('.show-details').click(function(){ showDetails(); });


          // Make sure table is sorted
      // var sorting = [[1,0], [0,0]]; 
      // // sort on the first column 

      // $('#sortable_table').trigger("update"); 
      // $('#sortable_table').trigger("sorton",[sorting]); 
  } 


  var processedUrls   = [ ];

  var processUrl = function(url)
  {
    // This function will be called for every dataset registered with the current city.  Many will have the same
    // server.  Avoid processing the same server twice.
    // Called from renderTable(), which is called from onCityChange() event handler
    if(processedUrls.hasObject(url)) {  /*setLayerStatus(url);*/ return;  }

    processedUrls.push(url);

    serverResponses[url] = [ ];    

    WMS.updateLayerList(url, onGetCapabilitiesSucceeded, onGetCapabilitiesFailed);
    WFS.updateLayerList(url, onGetCapabilitiesSucceeded, onGetCapabilitiesFailed);
    WCS.updateLayerList(url, onGetCapabilitiesSucceeded, onGetCapabilitiesFailed);
  }


  // Server has responded to our query and seems happy (from updateLayerList)
  // Explanation of args: http://docs.sencha.com/ext-js/3-4/#!/api/Ext.data.DataProxy-event-load
  var onGetCapabilitiesSucceeded = function(dataProxy, records, options) // Need to validate each item in dataProxy
  {
    var format  = dataProxy.format.name;
    var url     = unwrapServer(dataProxy.url, format);
    var service = getService(format);

    serverResponses[url].push( new ServerResponse(true, records.length, dataProxy, service));
                                                  
    setLayerStatus(url);
  }


  // We pepper each server with WMS, WFS, and WCS requests.  One of these has failed, 
  // which might be bad, or it might be perfectly fine.  It might mean that the server 
  // is down, or that it has not been configured to respond to a particular service.

  // Explanation of args: http://docs.sencha.com/ext-js/3-4/#!/api/Ext.data.DataProxy-event-exception
  var onGetCapabilitiesFailed = function(dataProxy, type, action, options, response, arg) {
    // status.responseText has response from data server?
    // We might get here if server the server does not support service WxS

    var format  = options.reader.meta.format.name;
    var url     = unwrapServer(dataProxy.url, format);
    var service = getService(format);

    // alert("server " + dataProxy.url + " had no " + service + " service");

    serverResponses[url].push( new ServerResponse(false, 0, null, service, 
                                                  response.status, response.responseText) );

    setLayerStatus(url);
  }


  var updateLayerInfo = function(serverUrl, dataset, available, name, descr, services) 
  {
    var railsId = railsIdLookup[makeKey(serverUrl, dataset)];

    $('.dataset-name2-' + railsId).html(name);    // Appears in the name column, also on infotable popup
    $('.dataset-descr-' + railsId).html(descr);
    $('#results-'       + railsId).html('');      // Clear

    var url = '';
    
    // Parse services... provide links for whatever services
    for (var i = 0; i < services.length; i++) {
      if(services[i] == 'WMS') {
        url = WMS.getCapUrl(serverUrl);
      }
      else if(services[i] == 'WFS') {
        url = WFS.getCapUrl(serverUrl);
      }
      else if(services[i] == 'WCS') {
        url = WCS.getCapUrl(serverUrl);
      }

      $('#results-' + railsId).append('<a href="' + url + '" target="_blank">' + services[i] + '</a>&nbsp;');
    }


    if(url != '') {
      $('#results-' + railsId).append('&nbsp;(Right-click, Copy Link Location)');
    }


    if(available) {
      $('.status2-' + railsId).html(
        '<img class="status-indicator" src="/assets/layer_available_yes.png" alt="Layer available">');
    } else {
      $('.status2-' + railsId).html('<img class="status-indicator" src="/assets/layer_available_no.png" alt="Layer not available">');
    }
  }

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
  }



  // Class that describes response from server, either success or failure
  var ServerResponse = function(success, records, dataProxy, service, responseCode, responseText) 
  {
    this.success     = success;
    this.recordCount = records;
    this.layerStore  = dataProxy;
    this.service     = service;
    this.errCode     = responseCode || null;
    this.errText     = responseText || null;

    if(success) { 

      var obj = dataProxy.reader.raw;

      if(service === "WMS") {
        // These work for both 1.1.1 and 1.3.0
        this.serverName  = obj.service.title || obj.service.name || "Map Server";
        this.serverDescr = obj.service.abstract || this.serverName;
      }
      else if(service === "WFS") {
        // These work for both 1.0.0 and 1.1.0
        this.serverName  = obj.service.name || "Web Feature Server";
        this.serverDescr = obj.service.title || this.serverName;
      }
      else if(service === "WCS") {
        // These work for both 1.0.0 and 1.1.0
        this.serverName  = obj.serviceIdentification.title || "Web Coverage Server";
        this.serverDescr = obj.serviceIdentification.abstract || this.serverName;
      }
    }
    else {
      this.serverName  == this.serverName  || "Data Server";
      this.serverDescr == this.serverDescr || "";
    }
  }


  // We have a response of some sort from serverUrl -- update the datasets table to show it.
  // serverResponses should be an array of 3 ServerResponse objects.
  var setLayerStatus = function(serverUrl)
  {
    var serverResponseArry = serverResponses[serverUrl];
    var serverUrlId        = serverUrlIdLookup[serverUrl];

    if(serverResponseArry[0].serverName) {
      $('.server-name-'  + serverUrlId).html(serverResponseArry[0].serverName);
      $('.server-descr-' + serverUrlId).html(serverResponseArry[0].serverDescr);
    }

    // Wait until we've heard back from all servers: wfs, wms, and wcs
    if(serverResponseArry.length < 3) { return; } 


    if(!(serverResponseArry[0].success || serverResponseArry[1].success || serverResponseArry[2].success)) {    
      // All services failed, all datasets from this server ganz kaput
      $('.status-' + serverUrlId).html('<img class="status-indicator" src="/assets/server_responding_no.png" alt="WMS server not responding">');
      $('.dataset-name-' + serverUrlId).text("Unknown");
      return;
    }

    // At least one server succeeded, vist each one-by-one

    debugger

    var datasets = serverDatasets[serverUrl];   // List of registered datasets available on this server

    datasetCount = datasets.length;

    for(var i = 0; i < datasetCount; i++) {     // Iterate through datasets from the server one-by-one
      var found = false;
      var layerRecordsCount = serverResponseArry.length;

      var services = [];

      for(var j = 0; j < layerRecordsCount && !found; j++) {
        var store    = serverResponseArry[j].layerStore;
        var records  = serverResponseArry[j].recordCount;
        services.push(serverResponseArry[j].service);

        for(var k = 0; k < records; k++) {
          var record = store.getAt(k);

          var identifier = record.get("name");

          if(datasets[i] == identifier) {
            var title = record.get("title") || record.get("name");
            title = title.replace(/ /g,'&nbsp;');


            updateLayerInfo(serverUrl, identifier, true, title, record.get("abstract"), services);

            found = true;
            break;
          }
        }
      }

      if(!found) {
        updateLayerInfo(serverUrl, datasets[i], false, datasets[i], 
          'This dataset could no longer be located on the data server',    // Descr
          [ ]);                                                            // Services
      }
    }
  }