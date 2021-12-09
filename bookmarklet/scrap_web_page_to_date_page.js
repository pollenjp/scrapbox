javascript: (function () {
  let project_name = "pollenJP-MEMO";
  let comment = "comment variable";

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

  const date = new Date();
  let date_str = date.format("yyyy-MM-dd");
  let time_str = date.format("hh:mm:ss");

  comment = "// Get the Web Page Information //";

  let href = window.location.href;
  var title = window.prompt(
    "Bookmark to Scrapbox",
    "[" + document.title + " " + href + "]"
  );
  if (title == null) return;
  let lines = [];
  let document_title_str = document.title.replace("[", "").replace("]", "");
  let link =
    "[Web Page.icon] [Web Page: " + document_title_str + " " + href + "]";

  lines.push("#date " + date_str + " " + time_str);
  let copy_lines = [" " + "code:copy.txt", " " + " " + link];
  lines = lines.concat(copy_lines);
  lines.push(" " + link);

  comment = "// 引用文追加 //";

  var quote = window.getSelection().toString();
  if (quote.trim()) {
    lines = lines.concat(
      quote.split(/\n/g).map(function (line) {
        if (line !== "") {
          return " > " + line;
        }
      })
    );
  }

  comment = "// 空白行の削除 //";

  let lines2 = [];
  for (var i = 0; i < lines.length; ++i) {
    if (lines[i] !== undefined) {
      lines2.push(lines[i]);
    }
  }

  comment = "// Insert Title //";

  if (title == "[" + document.title + " " + window.location.href + "]") {
    title = "";
  }
  if (title != "") {
    lines2.push(" " + title);
  }
  let body = encodeURIComponent(lines2.join("\n "));

  comment = "// Open the page //";

  window.open(
    "https://scrapbox.io/" +
      encodeURIComponent(project_name) +
      "/" +
      encodeURIComponent("date" + date_str) +
      "?body= " +
      body
  );
})();
