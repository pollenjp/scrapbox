javascript: (function () {
  let project_name = "pollenJP-MEMO";
  let comment = "comment variable";
  let lines = [];

  comment = "// Get the Web Page Information //";

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

  let href = window.location.href;
  let title = window.prompt("Bookmark to Scrapbox", document.title);
  if (title == null) return;
  comment = "// replace special characters //";
  title = title.replaceAll("[", "").replaceAll("]", "");
  comment = "// replace backquote //";
  title = title.replaceAll("`", "");
  comment = "// replace first slash (/) //";
  title = title.replace(/^\//, "\\/");

  get_sub_path = (url_str, idx1, idx2) => {
    let url =  new URL(url_str);
    let path_list = url.pathname.split("/").slice(1);
    if (idx2 > path_list.length) {
      break;
    }
    let ret = ""
    path_list.slice(idx1, idx2).forEach((name, idx) => {
      if (idx > 0) {
        ret += "/";
      }
      ret += name;
    });
    return ret;
  };


  let href = window.location.href;

  switch (window.location.hostname) {
    case "atcoder.jp":
      title += " (" + get_sub_path(href, 0, 2) + ")";
      break;

    case "github.com":
      title = title.split(":")[0];
      if (url.pathname.split("/").slice(1).length >= 2) {
        title += " (" + get_sub_path(href, 0, 1) + ")";
      }
      break;

    case "qiita.com":
      title += " (" + get_sub_path(href, 0, 2) + ")";
      break;
  }

  title += " (" + window.location.hostname + ")";
  lines.push(title);

  comment = "// add link //";

  let document_title_str = document.title
    .replaceAll("[", "")
    .replaceAll("]", "");

  lines.push(
    "[" + window.location.hostname + "]",
    "Scrap at [date" + date.format("yyyy-MM-dd") + "]",
    ""
  );
  lines.push(document_title_str);
  lines.push("[" + href + "]");

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

  comment = "// 空白行の削除 //";

  let lines2 = [];
  for (var i = 0; i < lines.length; ++i) {
    if (lines[i] !== undefined) {
      lines2.push(lines[i]);
    }
  }
  lines2.push("");
  var body = encodeURIComponent(lines2.join("\n"));

  comment = "// Open the page //";

  window.open(
    "https://scrapbox.io/" +
      encodeURIComponent(project_name) +
      "/" +
      encodeURIComponent(title.trim()) +
      "?body=" +
      body
  );
})();
