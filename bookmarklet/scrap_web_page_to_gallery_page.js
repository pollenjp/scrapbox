javascript: (function () {
  const project_name = "pollenJP-MEMO";
  let comment = "comment variable";

  comment = "// random string generator //";

  function generate_random_string(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  comment = "// Date Class //";

  Date.prototype.format = function (format) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return format
      .replace("ddd", days[this.getDay()])
      .replace("yyyy", this.getFullYear())
      .replace("MM", ("0" + (this.getMonth() + 1)).slice(-2))
      .replace("dd", ("0" + this.getDate()).slice(-2))
      .replace("hh", ("0" + this.getHours()).slice(-2))
      .replace("mm", ("0" + this.getMinutes()).slice(-2))
      .replace("ss", ("0" + this.getSeconds()).slice(-2));
  };

  comment = "// Get the Web Page Information //";

  let href = window.location.href;
  let lines = [];
  let document_title_str = document.title.replace("[", "").replace("]", "");
  let link =
    "[Web Page.icon] [Web Page: " + document_title_str + " " + href + "]";
  comment = "// add link //";
  lines.push(" " + link);

  comment = "// 引用文追加 //";

  var quote = window.getSelection().toString();
  if (quote.trim()) {
    lines = lines.concat(
      quote.split(/\n/g).map(function (line) {
        if (line !== "") {
          return "  > " + line;
        }
      })
    );
  }

  const date = new Date();
  let date_str = date.format("yyyy-MM-dd");

  comment = "////////////////////////////////////////////////////////////////";

  const scrapbox_page_title =
    "Memo - " + date.format("yyyyMMddhhmmss") + generate_random_string(20);
  let lines2 = ["#Gallery", "#date" + date_str, "", "[/icons/hr.icon]", ""];

  comment = "// ``lines`` の空白行の削除 //";

  for (var i = 0; i < lines.length; ++i) {
    if (lines[i] !== undefined) {
      lines2.push(lines[i]);
    }
  }
  lines2.push("");
  let body = encodeURIComponent(lines2.join("\n"));

  comment = "// Open the page //";

  window.open(
    "https://scrapbox.io/" +
      encodeURIComponent(project_name) +
      "/" +
      encodeURIComponent(scrapbox_page_title.trim()) +
      "?body=" +
      body
  );
})();
