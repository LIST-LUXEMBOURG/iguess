  // identifier is the thing you click on to expand/contract the accordion sections
  // container is the thing that actually gets hidden/shown when the identifier is clicked
  var initializeAccordion = function(identifier, container) {

    // Accordion initialization code -- allows user to reclose accordion item by clicking on header
    // This init code will be called repeatedly as we add a new item to the catalog.  This will let users expand items
    // before everything is fully loaded, making the UI feel much more responsive.  But we have to be careful not to     // add multiple click events to any item; to prevent this, we unbind everything before rebinding.

    $(identifier).unbind('click');  // Clear out previously added click handlers

    $(identifier).bind('click', function() {

      var animTime = 200;

      $(container).slideUp(animTime);   // Close any open panes

      if($(this).hasClass('current')) {
        $(this).removeClass('current');
      } else {
        $('.current').removeClass('current');
        $(this).addClass('current');
        $(this).next().slideDown(animTime);         // Open selected pane
      }
    });
  };