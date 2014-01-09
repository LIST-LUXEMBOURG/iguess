// These functions are used for registering services, both on the
// RegisterDatasets page and the RegisterWpsServer page


var pageHasPresets = function()
{
  return $("#url-preset-select").length > 0;
};


// Called by ready functions on parent pages 
var onLoadServicesPageReady = function()
{
  hideProbingIndicators();
  $('#load_services').attr('disabled', true);


  // Register some event handlers for our controls

  // What happens when URL entry box changes or loses focus?
  $('#server_url').keyup(updateButtonVisibility);
  $('#server_url').focus(function() { $('#load_services').html('Load'); });

  // User clicked the Load button
  $('#load_services').click(loadDataLayers);    


  if(pageHasPresets()) {
    $('#save-preset').hide();     
    $('#delete-preset').hide();

    $('#save-preset').click(savePreset);
    $('#delete-preset').click(deletePreset);

    // What to do if the user selects a preset
    $('#url-preset-select').change(function() { $("#server_url").val($(this).val()); 
                                                $(this).val(""); 
                                                updateButtonVisibility();
                                              });
  }
};


// Grabs the server URL from the URL input entry box
var getServerUrl = function() 
{ 
  return $("#server_url").val().trim(); 
};


var updatePresetVisibility = function(serverUrl)
{
  // Nothing to do if this page has no presets
  if(!pageHasPresets())
    return;

  if(serverUrl === "") {
    $("#save-preset").hide();
    $("#delete-preset").hide();
  } 
  else {
    var found = false;

    // Check if url is already on the preset list.  If not, add a save preset button.
    $("#url-preset-select > option").each(function() {
      if(this.value.trim() == serverUrl) 
        found = true;
    });


    if(found) {    
      $('#save-preset').hide();
      $('#delete-preset').show();
    }
    else {
      $('#save-preset').show();
      $('#delete-preset').hide();
    }
  }
};


var updateButtonVisibility = function()
{
  var serverUrl = getServerUrl();

  updatePresetVisibility(serverUrl);

  if(serverUrl === "") 
    $('#load_services').attr('disabled', true);

  else if(serverUrl === currentlyLoadedUrl) {
    $('#load_services').html('Reload')
                       .attr('disabled', false);
  }
  else {
    $('#load_services').html('Load')
                       .attr('disabled', false);
  }
};

var currentlyLoadedUrl = "";
var discoveredLayers = {};

// Prevent us from being swamped by the same error message over and over when working with WMS
var alreadyShownWmsError = false;


// This gets called when the Remote Data Server URL is changed
var loadDataLayers = function()
{
  var serverUrl = getServerUrl();
  currentlyLoadedUrl = serverUrl;

  updateButtonVisibility();

  if(serverUrl === "")  // No URL -- nothing more to do!
    return;   

  // Reset various displays
  $("#server-name").html("");   
  $("#error-list").html("").slideUp(200); // Clear and hide error box

  alreadyShownWmsError = false;
  discoveredLayers = {};

  showProbingIndicators();

  $("#results-display").html("");         // Clear results

  resetServiceLoadedStatus();

  var probe = new ServiceProbe(serverUrl);  // ServiceProbe will be a different class on different pages, but will have the same interface
  probe.startProbing();
};


// Note that details can be null here
var displayServerDetails = function(serverInfo, service) 
{
  if(serverInfo && $("#server-name").html() == "")
  {
    var serverName  = serverInfo.title    || "Unnamed Server";
    var serverDescr = serverInfo.abstract || "";

    $("#server-name").html("Server: " + serverName);
    $("#server-descr").html(linkify(serverDescr));

    $(".server-info").show();
  }
};


// Check response and see if it looks like it is good and requires further parsing
var isGoodResponse = function(service, response, capabilities)
{
  var code = response.status;   // Standard http response code herein
  if(code < 200 || code > 299)
    return false;

  // If a service does not exist, this next condition should be triggered
  if(response.responseXML.documentElement.tagName == "ows:ExceptionReport")
    return false;

  // Sometimes ESRI software send us data about the wrong service... these responses are invalid
  if(capabilities.requestType.substring(0, 3) != service)
    return false;

  return true;
};


// Tracks data about a server that we might want to display on the page
var ServerInfo = function(title, abstract)
{
  this.title    = title;
  this.abstract = abstract;
}