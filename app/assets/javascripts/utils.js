// Check if an object already exists in an array
// Usage: 
//    dataTypes.hasObject(id) returns true if id is already in the dataTypes array
//
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


// Combine server and other identifier to create a unique key 
makeKey = function(server, identifier) 
{
  try{
    // Strip out any special chars because these confuse things parsing the DOM!
    // Replace with nothing because sometimes things get here with the backslashes already munged out
    return (server.replace(/[\\\/:\.]/g, '') + '---' + identifier.replace(/[\\\/:\.]/g, ''));
  } catch(e) { debugger; }
}


// See http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
String.prototype.makeHash = function(){
    var hash = 0;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
