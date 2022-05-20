import "../scrapbox-script-popup-shortcut/script.js";

var tmp_name = "icon+label";
scrapbox.PopupMenu.addButton({
  title: tmp_name,
  onClick: function (text) {
    text = text.replace(/\[(.*)(?<!(\.icon))\]/g, "[$1.icon] [$1]");
    return text;
  },
});

scrapboxPopupShortcut(tmp_name, (e) => e.charCode == 0x7b /* "{" */);

var tmp_name = "wrap math";
scrapbox.PopupMenu.addButton({
  title: tmp_name,
  onClick: function (text) {
    text = " [$ " + text + " ] ";
    return text;
  },
});
