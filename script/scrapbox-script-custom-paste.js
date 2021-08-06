// When running on local
// - comment out import lines.
// - set DEBUG_MODE as true.
import "../scrapbox-script-popup-shortcut/script.js";
const DEBUG_MODE = false;
// const DEBUG_MODE = true;

class SpaceRemover {
  constructor({ remove_line_feed = true, one_sentence_newline = true } = {}) {
    this.remove_line_feed = remove_line_feed;
    this.one_sentence_newline = one_sentence_newline;
  }

  convert(text) {
    // CR+LF -> LF
    text = text.replace(/\r\n/g, "\n");
    // 英単語によく出てくる, 行終わりの単語の切れ目をつなげるようにする
    text = text.replace(/-\n/g, "");
    // remove line feed
    if (this.remove_line_feed) {
      text = text.replace(/\n/g, " ");
    }
    text = text.replace(/　/g, " "); // 全角スペースを半角スペースに変換
    // 連続する半角スペースを1つにする
    // 肯定先読み
    text = text.replace(/ (?=[ ])/g, "");
    text = text.replace(/[、，]/g, ",");

    text = text.replace(/。/g, ". "); // 全角 -> 半角
    text = text.replace(/．/g, ". "); // 全角 -> 半角

    text = text.replace(/：/g, ":"); // 全角 -> 半角
    text = text.replace(/；/g, ";"); // 全角 -> 半角

    if (this.one_sentence_newline) {
      text = text.replace(/\. +/g, ".\n");
    }

    // () の変換
    text = text.replace(/（/g, " (");
    text = text.replace(/）/g, ") ");

    // 日本語間のスペースを取り除く.
    // 肯定先読み
    text = text.replace(/([あ-んア-ン一-龥ー]) (?=[あ-んア-ン一-龥ー])/g, "$1");

    // remove empty lines
    text = text.replace(/\n(?=[\n])/g, "");
    return text;
  }
}

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

if (!DEBUG_MODE) {
  // scrapbox
  let title_name = "custom-paste";

  // PageMenu //
  scrapbox.PageMenu.addMenu({
    title: title_name,
    image: "https://i.gyazo.com/88d6eee6b65a29a2047a9f1810928ca9.png", // paste logo
    onClick: async () => {
      const text = prompt("text を paste してください");
      if (text === null) return;
      var space_remover = new SpaceRemover();
      insertText(space_remover.convert(text));
    },
  });

  // PopupMenu //
  scrapbox.PopupMenu.addButton({
    title: title_name,
    onClick: function (text) {
      const pasted_text = prompt("text を paste してください");
      if (pasted_text === null) return;
      var space_remover = new SpaceRemover();
      return space_remover.convert(pasted_text);
    },
  });

  // Alt + key //
  (() => {
    const aliases = {
      KeyV: function () {
        const text = prompt(
          "text を paste してください\n({remove_line_feed: true, one_sentense_new_line: true})"
        );
        if (text === null) return;
        var space_remover = new SpaceRemover({
          remove_line_feed: true,
          one_sentence_newline: true,
        });
        insertText(space_remover.convert(text));
      },
      KeyG: function () {
        const text = prompt(
          "text を paste してください\n({remove_line_feed: false, one_sentense_new_line: false})"
        );
        if (text === null) return;
        var space_remover = new SpaceRemover({
          remove_line_feed: false,
          one_sentence_newline: false,
        });
        insertText(space_remover.convert(text));
      },
      KeyF: function () {
        const text = prompt(
          "text を paste してください\n({remove_line_feed: false, one_sentense_new_line: true})"
        );
        if (text === null) return;
        var space_remover = new SpaceRemover({
          remove_line_feed: false,
          one_sentence_newline: true,
        });
        insertText(space_remover.convert(text));
      },
      KeyA: function () {
        const text = prompt("text を paste してください");
        if (text === null) return;
        var space_remover = new SpaceRemover({ one_sentence_newline: false });
        insertText(space_remover.convert(text));
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
} else {
  // sample debug
  var text = `
Net-
work
hello
world.
　<- 全角スペース
  <- 連続する半角スペース
私たちは、神。<-
私たちは，神．<-
やばすぎる　やばすぎる<-
日 本　語<-
fig1.1
hoge。ほげ。

hello world. come on!

ほとんどの開発現場では、ネットワーク管理者やサーバー管理者が、開発や運用のためのネットワークとサーバーを構築します。
`;
  var remover = new SpaceRemover({
    remove_line_feed: true,
    one_sentence_newline: true,
  });
  console.log(remover.convert(text));
}
