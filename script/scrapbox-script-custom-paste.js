// When running on local
// - set DEBUG_MODE as true.
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
    text = text.replace(/[、，]/g, ", ");

    text = text.replace(/。/g, ". "); // 全角 -> 半角
    text = text.replace(/．/g, ". "); // 全角 -> 半角

    text = text.replace(/：/g, ":"); // 全角 -> 半角
    text = text.replace(/；/g, ";"); // 全角 -> 半角
    text = text.replace(/／/g, "/"); // 全角 -> 半角
    text = text.replace(/？/g, "?"); // 全角 -> 半角
    text = text.replace(/！/g, "!"); // 全角 -> 半角

    if (this.one_sentence_newline) {
      text = text.replace(/\. +/g, ".\n");
      text = text.replace(/\? +/g, "?\n");
      text = text.replace(/\! +/g, "!\n");
    }

    // () の変換
    text = text.replace(/（/g, " (");
    text = text.replace(/）/g, ") ");

    // 日本語間のスペースを取り除く.
    // 肯定先読み
    text = text.replace(/([あ-んア-ン一-龥ー]) (?=[あ-んア-ン一-龥ー])/g, "$1");

    text = text.replace(/(\n) (?=[\n])/g, "$1"); // remove blank lines
    text = text.replace(/\n(?=[\n])/g, ""); // remove empty lines
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
  // Alt + key //
  (() => {
    const aliases = {
      KeyA: function () {
        const text = prompt("text を paste してください (すべて一行で展開)");
        if (text === null) return;
        var space_remover = new SpaceRemover({ one_sentence_newline: false });
        insertText(space_remover.convert(text));
      },
      KeyB: function () {
        const text = prompt("url を paste してください (encodeURI)");
        if (text === null) return;
        insertText(encodeURI(text));
      },
      // KeyF: function () {
      //   const text = prompt(
      //     "text を paste してください\n({remove_line_feed: false, one_sentense_new_line: true})"
      //   );
      //   if (text === null) return;
      //   var space_remover = new SpaceRemover({
      //     remove_line_feed: false,
      //     one_sentence_newline: true,
      //   });
      //   insertText(space_remover.convert(text));
      // },
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
a.

   

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
    remove_line_feed: false,
    one_sentence_newline: false,
  });
  console.log(remover.convert(text));
}
