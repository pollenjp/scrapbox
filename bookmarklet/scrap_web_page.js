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
  let this_page_url = new URL(href);
  let title = window.prompt("Bookmark to Scrapbox", document.title);
  if (title == null) return;
  comment = "// replace special characters //";
  title = title.replaceAll("[", "").replaceAll("]", "");
  comment = "// replace backquote //";
  title = title.replaceAll("`", "");
  comment = "// replace first slash (/) //";
  title = title.replace(/^\//, "\\/");

  split_path = (url_path) => {
    let pathList = url_path.split("/").slice(1);
    if (pathList.slice(-1)[0].length == 0) {
      pathList = pathList.slice(pathList.length - 1);
    }
    return pathList;
  };

  get_sub_path = (url, idx1, idx2) => {
    let pathList = split_path(url.pathname);
    if (idx2 > pathList.length) {
      throw "index is out of range!";
    }
    let ret = "";
    pathList.slice(idx1, idx2).forEach((name, idx) => {
      if (idx > 0) {
        ret += "/";
      }
      ret += name;
    });
    return ret;
  };

  {
    let tmpBody = [];
    let hostname = window.location.hostname;
    switch (hostname) {
      case "atcoder.jp":
        title += " (" + get_sub_path(this_page_url, 0, 2) + ")";
        break;

      case "github.com":
        {
          let pathList = split_path(this_page_url.pathname);
          switch (pathList.length) {
            case 0:
              break;
            case 1:
              title = pathList[0];
              break;
            case 2:
              title = title.split(":")[0];
              tmpBody.push("[" + pathList[0] + " (" + hostname + ")]");
              break;
            default:
              title = title.split(":")[0];
              var path = get_sub_path(this_page_url, 0, 2);
              title += " (" + path + ")";
              tmpBody.push("[" + path + " (" + hostname + ")]");
          }
        }
        break;

      case "qiita.com":
        {
          let pathList = split_path(this_page_url.pathname);
          let username = pathList[0];
          switch (pathList.length) {
            case 1:
              title = username;
              break;
            case 3:
              comment = "https://qiita.com/<username>/items/<uuid>";
              title += " (" + username + ")";
              tmpBody.push("[" + username + " (" + hostname + ")]");
              break;
          }
        }
        break;

      case "zenn.dev":
        {
          let pathList = split_path(this_page_url.pathname);
          let username = pathList[0];
          switch (pathList.length) {
            case 1:
              title = username;
              break;
            case 3:
              comment = "https://zenn.dev/<username>/articles/<uuid>";
              title += " (" + username + ")";
              tmpBody.push("[" + username + " (" + hostname + ")]");
              break;
          }
        }
        break;
    }
    title += " (" + hostname + ")";
    lines.push(title);
    tmpBody.forEach((line) => {
      lines.push(line);
    });
  }

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
