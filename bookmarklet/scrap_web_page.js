javascript: (function () {
  let project_name = "pollenJP-Memo";

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
  comment = "// remove url from title";
  title = title.replaceAll(/(https?:\/\/[^ ]*)/g, "");

  split_path = (url_path) => {
    let pathList = url_path.split("/").slice(1);
    if (pathList.slice(-1)[0].length == 0) {
      pathList = pathList.slice(0, -1);
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

  let img_href_array = [];
  {
    let tmpBody = [];
    let hostname = window.location.hostname;
    switch (hostname) {
      case "atcoder.jp":
        title += " (" + get_sub_path(this_page_url, 0, 2) + ")";
        break;

      case "github.com":
      case "gitlab.com":
        generateContentsGithubCom = (title, hostname, urlPathList) => {
          comment =
            "urlPathList = 'https://github.com/pollenjp/scrapbox/tree/0d4300fae19958c6726653d88f0c68982450b647/bookmarklet'";

          let body = [];
          switch (urlPathList.length) {
            case 0:
              break;
            case 1:
              title = urlPathList[0];
              break;
            case 2:
              title = urlPathList.slice(0, 2).join("/");
              body.push("[" + urlPathList[0] + " (" + hostname + ")]");
              break;
            default: {
              switch (urlPathList[2]) {
                case "tree":
                case "blob":
                  {
                    title = urlPathList.join("/");
                    let path = urlPathList.slice(0, 2).join("/");
                    body.push("[" + path + " (" + hostname + ")]");
                  }
                  break;
                case "issues":
                default: {
                  let path = urlPathList.slice(0, 2).join("/");
                  title += " (" + path + ")";
                  body.push("[" + path + " (" + hostname + ")]");
                }
              }
            }
          }

          return {
            title: title,
            body: body,
          };
        };
        {
          let content = generateContentsGithubCom(
            title,
            hostname,
            split_path(this_page_url.pathname)
          );
          title = content["title"];
          tmpBody = tmpBody.concat(content["body"]);
        }
        break;

      case "gist.github.com":
        {
          let pathList = split_path(this_page_url.pathname);
          switch (pathList.length) {
            case 0:
              break;
            case 1:
              title = pathList[0];
              break;
            case 2:
              let username = pathList[0];
              let page_hash = pathList[1];
              title += " (" + page_hash + ") (" + username + ")";
              tmpBody.push("[" + username + " (github.com)]");
              break;
            default:
              alert("Failed: " + pathList);
          }
        }
        break;

      case "speakerdeck.com":
        comment = "https://speakerdeck.com/<username>/<title>";
        {
          let pathList = split_path(this_page_url.pathname);
          let username = pathList[0];
          switch (pathList.length) {
            case 1:
              title = username;
              break;
            case 2:
              title += " (" + username + ")";
              tmpBody.push("[" + username + " (" + hostname + ")]");
              break;
          }
        }
        break;

      case "qiita.com":
      case "zenn.dev":
        comment = "https://qiita.com/<username>/items/<uuid>";
        comment = "https://zenn.dev/<username>/articles/<uuid>";
        {
          let pathList = split_path(this_page_url.pathname);
          let username = pathList[0];
          switch (pathList.length) {
            case 1:
              title = username;
              break;
            case 3:
              title += " (" + username + ")";
              tmpBody.push("[" + username + " (" + hostname + ")]");
              break;
          }
        }
        break;
      case "twitter.com":
      case "mobile.twitter.com":
        function get_twitter_image_hrefs(images) {
          let img_href_array = [];
          images.forEach(function (img) {
            if (img.alt == "Image" || img.alt == "画像") {
              let img_url = new URL(img.src);
              img_href_array.push(img_url.origin + img_url.pathname + ".jpg");
            }
          });
          return img_href_array;
        }

        let images = [].slice.call(document.querySelectorAll("img"));
        img_href_array = get_twitter_image_hrefs(images);
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
  lines.push(href);

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

  comment = "画像追加";

  img_href_array.forEach((href) => {
    lines.push("[" + href + "]");
  });

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
