const DEBUG_MODE = true;
class SpaceRemover {
  constructor(
    options /* : dict */ = {
      line_feed: true,
      half_width_space: true,
      full_width_space: true,
    }
  ) {
    this.options = options;
  }

  remove_line_feed(text) {
    return text.replace("\n", "");
  }

  convert(text) {
    text = text.replace(/\r\n/g, "\n");
    // 英単語によく出てくる, 行終わりの単語の切れ目をつなげるようにする
    text = text.replace(/-\n/g, "");
    text = text.replace(/\n/g, " "); // convert line feed to white-space
    text = text.replace(/　/g, " "); // 全角スペースを半角スペースに変換
    text = text.replace(/ +/g, " "); // 連続する半角スペースを1つにする
    text = text.replace(/[、，]/g, ",");
    // text = text.replace(/，/g, ",");
    text = text.replace(/。/g, ".");
    text = text.replace(/．/g, ".");

    // () の変換
    text = text.replace(/（/g, " (");
    text = text.replace(/）/g, ") ");

    // 日本語間のスペースを取り除く.
    // 肯定先読み
    text = text.replace(/([あ-んア-ン一-龥ー]) (?=[あ-んア-ン一-龥ー])/g, "$1");
    return text;
  }
}

if (!DEBUG_MODE) {
  // scrapbox
  var space_remover = new SpaceRemover();
  scrapbox.PageMenu.addMenu({
    title: "custom-paste",
    image: "https://i.gyazo.com/88d6eee6b65a29a2047a9f1810928ca9.png", // paste logo
    onClick: async () => {
      const text = prompt("text を paste してください");
      if (text === null) return;

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

      insertText(space_remover.convert(text));
    },
  });
} else {
  // sample debug
  var remover = new SpaceRemover();
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
ほとんどの開発現場では、ネットワーク管理者やサーバー管理者が、開発や運用のためのネットワークとサーバーを構築します。
`;
  console.log(remover.convert(text));
}
