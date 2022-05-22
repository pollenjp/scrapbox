javascript: (function () {
  let project_name = "pollenJP-MEMO";
  let comment = "comment variable";
  let header_lines = ["author: ", "[Vocaloid Music]"];
  let body_lines = [""];

  comment = "// Get the Web Page Information //";

  let href = window.location.href;
  let title = window.prompt("Bookmark to Scrapbox", document.title);
  if (title == null) return;
  title = title.replaceAll("[", "").replaceAll("]", "");

  comment = "// add link //";

  let document_title_str = document.title
    .replaceAll("[", "")
    .replaceAll("]", "");
  body_lines.push(document_title_str);
  body_lines.push("[" + href + "]");

  comment = "// 引用文追加 //";

  var quote = window.getSelection().toString();
  if (quote.trim()) {
    body_lines = body_lines.concat(
      quote.split(/\n/g).map(function (line) {
        if (line !== "") {
          return "  > " + line;
        }
      })
    );
  }

  comment = "// 空白行の削除 //";

  let lines2 = [];
  for (var i = 0; i < body_lines.length; ++i) {
    if (body_lines[i] !== undefined) {
      lines2.push(body_lines[i]);
    }
  }
  lines2.push("");
  body_lines = lines2;

  comment = "// encode lines //";

  body_lines = header_lines.concat(body_lines);
  var body = encodeURIComponent(body_lines.join("\n"));

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
