// Check if an object already exists in an array
// Usage:
//    dataTypes.hasObject(id) returns true if id is already in the dataTypes array
//
if(!Array.prototype.hasObject) {
  Array.prototype.hasObject = (
    !Array.indexOf ? function (o) {
      var l = this.length + 1;
      while (l -= 1) {
          if (this[l - 1] === o)  { return true; }
      }
      return false;
    } : function (o) {
      return (this.indexOf(o) !== -1);
    }
  );
}


// Populate a select box control from a specified list of options
// Options should be an array of items
populateSelectBox = function(control, options) {
  var n = options.length;

  for (var i = 0; i < n; i++) {
    var optn = document.createElement("OPTION");
    optn.text = options[i];
    optn.value = options[i];

    control.options.add(optn);
  }
}


// General handler for ajax requests that return an unexpected error
var ajaxErrorHandler = function(jqXHR, status, error, msg)
{
  // Often, if we encounter a rails error, jqXHR.status will be 500.  Show that error
  // in a new window because responseText will contain a full HTML document.
  if(jqXHR.status == 500)
  {
    var win = window.open();
    if(win)
    {
      $(win.document.body).html("<h1>Encountered error:</h1>" + jqXHR.responseText);
      return;
    }

    // Can't open window... thorow this up as a last ditch effort to report the error
    alert(msg + "  Can't open window... got error: " + jqXHR.responseText + '")');
    return;
  }
  
  alert(msg + ' (server says: "' + jqXHR.responseText + '")');
};


// See http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
if(!String.prototype.makeHash) {
  String.prototype.makeHash = function() {
      var hash = 0;
      if (this.length == 0) return hash;
      for (i = 0; i < this.length; i++) {
          char = this.charCodeAt(i);
          hash = ((hash<<5)-hash)+char;
          hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
  };
}


// From http://stackoverflow.com/questions/1026069/capitalize-the-first-letter-of-string-in-javascript
if(!String.prototype.capitalize) {
  String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
  };
}


// Remove illegal characters from CSS identifiers
cssEscape = function(id)
{
  return id.replace(/[^a-z,A-Z,_,-,0-9]/g, 'X');
}
