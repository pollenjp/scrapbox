javascript: (function () {
  let project_name = "pollenJP-MEMO";
  let comment = "comment variable";
  let body_lines = [];
  let lines;
  comment = "// Get the Web Page Information //";
  let href = window.location.href;
  let title = window.prompt("Bookmark to Scrapbox", document.title);
  if (title == null) return;
  title = title.replaceAll("[", "").replaceAll("]", "");
  comment = "// add link //";
  let document_title_str = document.title
    .replaceAll("[", "")
    .replaceAll("]", "");
  title = "【論文】 " + title;
  lines = [
    "#Research",
    "#論文 [parent.icon]",
    "",
    "TODO: [論文]にこのページへのリンクを載せる.",
    "code:text",
    " Submission history",
    "",
    "x",
    " x",
    "  " + document_title_str,
    "  [" + href + "]",
    " [arXiv.icon]",
    "  x",
    " [IEEE.icon]",
    "  x",
    " [GitHub.icon]",
    "  x",
    " [(icon) Papers with Code.icon]",
    "  x",
    "code:cite.txt",
    "",
    "thumbnail",
    "",
    "[** 内容まとめ]",
    "",
    "",
  ];

  body_lines = body_lines.concat(lines);

  comment = "// 引用文追加 //";

  var quote = window.getSelection().toString();
  if (quote.trim()) {
    lines = quote.split(/\n/g).map(function (line) {
      if (line !== "") {
        return "  > " + line;
      }
    });
    body_lines = body_lines.concat(lines);
  }

  comment = "// 空白行の削除 //";

  lines = [];
  for (var i = 0; i < body_lines.length; ++i) {
    if (body_lines[i] !== undefined) {
      lines.push(body_lines[i]);
    }
  }

  lines.push("");

  body_lines = lines;

  comment = "// Open the page //";

  window.open(
    "https://scrapbox.io/" +
      encodeURIComponent(project_name) +
      "/" +
      encodeURIComponent(title.trim()) +
      "?body=" +
      encodeURIComponent(body_lines.join("\n"))
  );
})();
