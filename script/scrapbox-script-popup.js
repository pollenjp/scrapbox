import "../scrapbox-script-popup-shortcut/script.js";

var tmp_name = "icon+label";
scrapbox.PopupMenu.addButton({
  title: tmp_name,
  onClick: function (text) {
    const target_text = text;
    let ret_text = "";
    let re = /\[(?<name>.*?)(^\])*\]/g;
    // let re = /\[(.*?)(^\])*\]/g;
    let prev_idx = 0;
    let match;
    while ((match = re.exec(target_text)) != null) {
      const match_text = match[0];
      // const match_groups_name = match_text;
      const match_groups_name = match.groups.name;
      const match_idx = re.lastIndex - match_text.length;
      ret_text += target_text.slice(prev_idx, match_idx);
      prev_idx = re.lastIndex;

      if (match_text.endsWith(".icon]")) {
        // [hoge.icon] は変更しない
        ret_text += match_text;
        continue;
      }

      // [sample.icon] [sample] の形であれば変換しない.
      // "[sample.icon] ".length == match_text.length + 1
      const icon_name = `[${match_groups_name}.icon] `;
      console.log(icon_name);
      console.log(match_idx + 1 > icon_name.length);
      console.log(target_text.slice(match_idx - icon_name.length, match_idx));

      if (
        match_idx + 1 > icon_name.length &&
        target_text.slice(match_idx - icon_name.length, match_idx) == icon_name
      ) {
        ret_text += match_text;
        continue;
      }

      ret_text += `[${match_text.slice(1, -1)}.icon] ${match_text}`;
    }

    if (prev_idx > 0) {
      ret_text += target_text.slice(prev_idx);
    }

    return ret_text;
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
