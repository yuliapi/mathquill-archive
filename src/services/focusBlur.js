Controller.open(function(_) {
  _.focusBlurEvents = function() {
    var ctrlr = this, root = ctrlr.root, cursor = ctrlr.cursor;
    var blurTimeout;
    ctrlr.textarea.focus(function() {
      ctrlr.blurred = false;
      clearTimeout(blurTimeout);
      root.jQ.addClass('focused');
      if (!cursor.parent)
        cursor.insAtRightEnd(root);
      if (cursor.selection) {
        cursor.selection.jQ.removeClass('blur');
        ctrlr.selectionChanged(); //re-select textarea contents after tabbing away and back
      }
      else
        cursor.show();
    }).blur(function() {
      ctrlr.blurred = true;
      blurTimeout = setTimeout(function() { // wait for blur on window; if
        root.postOrder('intentionalBlur'); // none, intentional blur: #264
        cursor.clearSelection();
        blur();
      });
      $(window).on('blur', windowBlur);
    });
    function windowBlur() { // blur event also fired on window, just switching
      clearTimeout(blurTimeout); // tabs/windows, not intentional blur
      if (cursor.selection) cursor.selection.jQ.addClass('blur');
      blur();
    }
    function blur() { // not directly in the textarea blur handler so as to be
      cursor.hide().parent.blur(); // synchronous with/in the same frame as
      root.jQ.removeClass('focused'); // clearing/blurring selection
      $(window).off('blur', windowBlur);
    }
    ctrlr.blurred = true;
    cursor.hide();
  };
});

/**
 * TODO: I wanted to move MathBlock::focus and blur here, it would clean
 * up lots of stuff like, TextBlock::focus is set to MathBlock::focus
 * and TextBlock::blur calls MathBlock::blur, when instead they could
 * use inheritance and _super.
 *
 * Problem is, there's lots of calls to .focus()/.blur() on nodes
 * outside Controller::focusBlurEvents(), such as .postOrder('blur') on
 * insertion, which if MathBlock::blur becomes Node::blur, would add the
 * 'blur' CSS class to all Symbol's (because .isEmpty() is true for all
 * of them).
 *
 * I'm not even sure there aren't other troublesome calls to .focus() or
 * .blur(), so this is TODO for now.
 */