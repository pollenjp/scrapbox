javascript: (function () {
  let project_name = "pollenJP-MEMO";
  let comment = "comment variable";
  let lines = [];

  comment = "// Get the Web Page Information //";

  let href = window.location.href;
  let title = window.prompt("Bookmark to Scrapbox", document.title);
  if (title == null) return;
  comment = "// replace special characters //";
  title = title.replaceAll("[", "").replaceAll("]", "");
  comment = "// replace backquote //";
  title = title.replaceAll("`", "");
  comment = "// replace first slash (/) //";
  title = title.replaceAll("^/", "");

  if (window.location.hostname == "github.com") {
    title = title.split(":")[0];
  }

  title += " (" + window.location.hostname + ")";
  lines.push(title);

  comment = "// add link //";

  let document_title_str = document.title
    .replaceAll("[", "")
    .replaceAll("]", "");

  lines.push("[" + window.location.hostname + "]", "");
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
