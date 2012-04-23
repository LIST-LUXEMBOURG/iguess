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


// Combine server and layer name to create a unique key 
makeKey = function(server, name) 
{
  try{
  // Strip out any backslashes because these screw things up!
  return server.replace(/\\/g, '') + '+*+' + name.replace(/\\/g, '');
  } catch(e) { debugger; }
}

