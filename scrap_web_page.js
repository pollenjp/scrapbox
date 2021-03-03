javascript: (function () {
  let project_name = "pollenJP-MEMO";
  let comment = "comment variable";
  let lines = [];

  comment = "// Get the Web Page Information //";

  let href = window.location.href;
  let title = window.prompt(
    "Bookmark to Scrapbox",
    document.title + " " + href
  );
  if (title == null) return;
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

  comment = "// 空白行の削除 //";

  let lines2 = [];
  for (var i = 0; i < lines.length; ++i) {
    if (lines[i] !== undefined) {
      lines2.push(lines[i]);
    }
  }
  var body = encodeURIComponent(lines.join("\n"));

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
