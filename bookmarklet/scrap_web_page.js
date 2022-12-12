javascript: (function () {
  let project_name = "pollenJP-Memo";

  let comment = "comment variable";

  comment = "// Define data classes //";

  comment = "params";
  comment = "- title:string";
  comment = "- body[:string] ";
  comment = "- img_href_array[:string] ";

  class ParsedData {
    constructor({ title, body } = []) {
      this._title = title;
      this._body = body;
    }
    get title() {
      return this._title;
    }
    get body() {
      return this._body;
    }
  }

  comment = "// Define Functions //";

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

  function split_url_path(url_path) {
    let pathList = url_path.split("/").slice(1);
    if (pathList.slice(-1)[0].length == 0) {
      pathList = pathList.slice(0, -1);
    }
    return pathList;
  }

  comment = "path:string";
  function returnTitlePathPart(path) {
    if (path.length == 1) {
      return "";
    }
    return " (" + path + ")";
  }

  comment = "params";
  comment = "- images:NodeList[:HTMLElement]";
  comment = "return:[:string]";
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

  comment = "// End Define Functions //";

  comment = "// Define Parsers //";

  comment = "params";
  comment = "- title:string";
  comment = "- url:URL";

  class PageParser {
    constructor({ title, url, document } = {}) {
      this._title = title;
      this._body = [];
      this._url = url;
      this._document = document;

      comment =
        "https://github.com/pollenjp/scrapbox/tree/0d4300fae19958c6726653d88f0c68982450b647/bookmarklet";
      comment = "=> [";
      comment = " 'pollenjp',";
      comment = " 'scrapbox',";
      comment = " '0d4300fae19958c6726653d88f0c68982450b647',";
      comment = " 'bookmarklet',";
      comment = "]";

      this._urlPathList = split_url_path(this._url.pathname);
    }

    do() {
      console.log("parsePreCommon");
      this.#parsePreCommon();
      console.log("parsePreCustom");
      this.parsePreCustom();
      console.log("parseMiddleCommon");
      this.#parseMiddleCommon();
      console.log("parsePostCustom");
      this.parsePostCustom();
      console.log("parsePostCommon");
      this.#parsePostCommon();

      return new ParsedData({
        title: this._title,
        body: this._body,
      });
    }

    #parsePreCommon() {}

    parsePreCustom() {
      throw new Error(
        "Not Implemented Error: This method should be overrided."
      );
    }

    #parseMiddleCommon() {
      this._body.push(
        "[" + this._url.hostname + "]",
        "Scrap at [date" + date.format("yyyy-MM-dd") + "]",
        "",
        "`" + this._document.title + "`",
        this._url.toString(),
        ""
      );
    }

    parsePostCustom() {
      throw new Error(
        "Not Implemented Error: This method should be overrided."
      );
    }

    #parsePostCommon() {
      comment = "// title //";

      this._title += " (" + this._url.hostname + ")";
      this._body.unshift(this._title);

      comment = "// body //";

      let quote = window.getSelection().toString();
      let lines = [];
      if (quote.trim()) {
        lines.push(
          quote.split(/\n/g).map(function (line) {
            if (line !== "") {
              return "  > " + line;
            }
          })
        );
      }

      comment = "// 空白行の削除 //";

      for (var i = 0; i < lines.length; ++i) {
        if (lines[i] !== undefined) {
          this._body.push(lines[i]);
        }
      }
    }
  }

  class OtherPageParser extends PageParser {
    parsePreCustom() {
      this._title += returnTitlePathPart(this._url.pathname);
    }

    parsePostCustom() {}
  }

  class AtcoderJpPageParser extends PageParser {
    parsePreCustom() {
      this._title += " (" + this._urlPathList.slice(0, 2).join("/") + ")";
    }

    parsePostCustom() {}
  }

  class GitHubComPageParser extends PageParser {
    parsePreCustom() {
      switch (this._urlPathList.length) {
        case 0:
          break;
        case 1: {
          let username = this._urlPathList[0];
          this._title = username;
          break;
        }
        case 2: {
          let username = this._urlPathList[0];
          let reposName = this._urlPathList[1];

          this._title = username + "/" + reposName;
          this._body.push("[" + username + " (" + this._url.hostname + ")]");
          break;
        }
        default: {
          let username = this._urlPathList[0];
          let reposName = this._urlPathList[1];
          let itemName = this._urlPathList[2];

          switch (itemName) {
            case "tree":
            case "blob": {
              this._title = this._urlPathList.join("/");

              this._body.push(
                "[" +
                  username +
                  "/" +
                  reposName +
                  " (" +
                  this._url.hostname +
                  ")]"
              );
              break;
            }
            case "issues":
            default: {
              this._title += returnTitlePathPart(this._url.pathname);

              let path = this._urlPathList.slice(0, 2).join("/");
              this._body.push("[" + path + " (" + this._url.hostname + ")]");
            }
          }
        }
      }
    }

    parsePostCustom() {}
  }

  class GistGitHubComPageParser extends PageParser {
    parsePreCustom() {
      switch (this._urlPathList.length) {
        case 0:
          break;
        case 1: {
          let username = this._urlPathList[0];
          this._title = username;
          break;
        }
        case 2: {
          let username = this._urlPathList[0];

          this._title = this._urlPathList.join("/");
          this._body.push("[" + username + " (" + this._url.hostname + ")]");
          break;
        }
        default: {
          alert("Failed: " + this._urlPathList);
        }
      }
    }

    parsePostCustom() {}
  }

  class SpeackerdeckComPageParser extends PageParser {
    parsePreCustom() {
      let username = pathList[0];
      switch (this._urlPathList.length) {
        case 1: {
          this._title = username;
          break;
        }
        case 2: {
          this._title += returnTitlePathPart(this._url.pathname);
          this._body.push("[" + username + " (" + this._url.hostname + ")]");
          break;
        }
      }
    }

    parsePostCustom() {}
  }

  class QiitaComPageParser extends PageParser {
    parsePreCustom() {
      let username = this._urlPathList[0];
      switch (this._urlPathList.length) {
        case 1:
          this._title = username;
          break;
        case 3:
          this._title += returnTitlePathPart(this._url.pathname);
          tmpBody.push("[" + username + " (" + this._url.hostname + ")]");
          break;
        default:
          this._title += returnTitlePathPart(this._url.pathname);
      }
    }

    parsePostCustom() {}
  }

  class TwitterComPageParser extends PageParser {
    parsePreCustom() {}

    parsePostCustom() {
      get_twitter_image_hrefs(
        [].slice.call(this._document.querySelectorAll("img"))
      ).forEach((href) => {
        this._body.push("[" + href + "]");
      });
    }
  }

  function parsePage({ title, this_page_url, document } = {}) {
    let tmpBody = [];
    let data = null;
    console.log("parsePage");
    switch (this_page_url.hostname) {
      case "atcoder.jp": {
        return new AtcoderJpPageParser({
          title: title,
          url: this_page_url,
          document: document,
        }).do();
      }
      case "github.com":
      case "gitlab.com": {
        return new GitHubComPageParser({
          title: title,
          url: this_page_url,
          document: document,
        }).do();
      }

      case "gist.github.com": {
        return new GistGitHubComPageParser({
          title: title,
          url: this_page_url,
          document: document,
        }).do();
      }

      case "speakerdeck.com": {
        comment = "https://speakerdeck.com/<username>/<title>";
        return new SpeackerdeckComPageParser({
          title: title,
          url: this_page_url,
          document: document,
        }).do();
      }

      case "qiita.com":
      case "zenn.dev": {
        comment = "https://qiita.com/<username>/items/<uuid>";
        comment = "https://zenn.dev/<username>/articles/<uuid>";
        return new QiitaComPageParser({
          title: title,
          url: this_page_url,
          document: document,
        }).do();
      }

      case "twitter.com":
      case "mobile.twitter.com": {
        return new TwitterComPageParser({
          title: title,
          url: this_page_url,
          document: document,
        }).do();
      }

      default: {
        return new OtherPageParser({
          title: title,
          url: this_page_url,
          document: document,
        }).do();
      }
    }
    throw new Error("No returns");
  }

  comment = "///////////////////////////////////////////";

  comment = "// Get the Web Page Information //";

  const date = new Date();

  {
    let this_page_url = new URL(window.location.href);
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

    let data = parsePage({
      title: title,
      this_page_url: this_page_url,
      document: document,
    });

    console.log(data);
    window.open(
      "https://scrapbox.io/" +
        encodeURIComponent(project_name) +
        "/" +
        encodeURIComponent(data.title.trim()) +
        "?body=" +
        encodeURIComponent(data.body.join("\n"))
    );
  }
})();
