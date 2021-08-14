function insertText(text) {
  const cursor = document.getElementById("text-input");
  cursor.focus();
  const start = cursor.selectionStart; // in this case maybe 0
  cursor.setRangeText(text);
  cursor.selectionStart = cursor.selectionEnd = start + text.length;
  const uiEvent = document.createEvent("UIEvent");
  uiEvent.initEvent("input", true, false);
  cursor.dispatchEvent(uiEvent);
}

// Alt + key //
(() => {
  const aliases = {
    KeyS: function () {
      insertText("[parent.icon]");
    },
  };

  const onKeyDown = function (e) {
    if (e.altKey && e.code in aliases) {
      e.preventDefault();
      aliases[e.code]();
    }
  };

  document.addEventListener("keydown", onKeyDown);
})();
