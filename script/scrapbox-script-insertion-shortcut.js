import { CustomDate } from "/api/code/pollenJP-MEMO/scrapbox-script-date/script.js";

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
    KeyC: function (shiftkey /* bool */) {
      if (shiftkey) {
        return;
      }
      insertText("code:");
    },
    KeyE: function (shiftkey /* bool */) {
      if (shiftkey) {
        return;
      }
      const d = new CustomDate();
      const dateFormat = "yyyy/MM/dd hh:mm:ss";
      insertText(`${d.format(dateFormat)}`);
    },
    KeyF: function (shiftkey /* bool */) {
      /* 押しやすさゆえに一時的な挿入キーとしての役割 */
      if (shiftkey) {
        insertText(" (my.cnf)");
        return;
      }
      insertText("[** [pollenjp.icon] log]");
    },
    KeyI: function (shiftkey /* bool */) {
      if (shiftkey) {
        return;
      }
      insertText("[pollenJP.icon] ( [pollenJP] ) ");
    },
    KeyM: function (shiftkey /* bool */) {
      if (shiftkey) {
        return;
      }
      insertText("[$  ] ");
    },
    KeyP: function (shiftkey /* bool */) {
      if (shiftkey) {
        return;
      }
      insertText(`[PERSON]`);
    },
    KeyR: function (shiftkey /* bool */) {
      if (shiftkey) {
        return;
      }
      const d = new CustomDate();
      const dateFormat = "yyyy-MM-dd";
      insertText(`${d.format(dateFormat)}`);
    },
    KeyS: function (shiftkey /* bool */) {
      if (shiftkey) {
        return;
      }
      insertText("[parent.icon]");
    },
    KeyW: function (shiftkey /* bool */) {
      if (shiftkey) {
        return;
      }
    },
  };

  const onKeyDown = function (e) {
    if (e.altKey && e.code in aliases) {
      console.log(e.code);
      e.preventDefault();
      aliases[e.code](e.shiftKey);
    }
  };

  document.addEventListener("keydown", onKeyDown);
})();
