javascript: (function () {
  let project_name = "pollenJP-Memo";

  /**
   * dataclass
   */
  class ParsedData {
    /**
     *
     * @param {string} title
     * @param {Array} body
     */
    constructor(title, body) {
      /**
       * title
       * @type {string}
       */
      this._title = title;

      /**
       * body
       * @type {Array<string>}
       */
      this._body = body;
    }

    get title() {
      return this._title;
    }

    get body() {
      return this._body;
    }
  }

  /* Define Functions */

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

  /**
   *
   * @param {string} urlPath
   * @returns {Array<String>}
   */
  function splitUrlPath(urlPath) {
    let pathList = urlPath.split("/").slice(1);
    if (pathList.slice(-1)[0].length == 0) {
      pathList = pathList.slice(0, -1);
    }
    return pathList;
  }

  /**
   *
   * @param {string} path
   * @returns
   */
  function returnTitlePathPart(path) {
    if (path.length == 1) {
      return "";
    }
    return " (" + path + ")";
  }

  /**
   *
   * @param {NodeList} imageElems
   * @returns {Array<URL>}
   */
  function getTwitterImageUrls(imageElems) {
    /**
     * Image URLs
     * @type {Array<URL>}
     */
    let imgUrls = [];
    imageElems.forEach(function (imgElem) {
      if (imgElem.alt == "Image" || imgElem.alt == "画像") {
        let img_url = new URL(imgElem.src);
        imgUrls.push(new URL(img_url.origin + img_url.pathname + ".jpg"));
      }
    });
    return imgUrls;
  }

  /* End Define Functions */

  /**
   * Base Class
   */
  class PageParser {
    /**
     *
     * @param {string} title
     * @param {URL} url
     * @param {Document} document
     */
    constructor(title, url, document) {
      /**
       * title
       * @type {string}
       */
      this._title = title;

      /**
       * body
       * @type {Array<String>}
       */
      this._body = [];

      /**
       * url
       * @type {URL}
       */
      this._url = url;

      /**
       * document
       * @type {Document}
       */
      this._document = document;

      /**
       */
      /**
       * Url Path List
       * @type {Array<String>}
       * @description
       *   "https://github.com/pollenjp/scrapbox/tree/0d4300fae19958c6726653d88f0c68982450b647/bookmarklet";
       *   => [
       *   'pollenjp',
       *   'scrapbox',
       *   '0d4300fae19958c6726653d88f0c68982450b647',
       *   'bookmarklet',
       *   ]
       */
      this._urlPathList = splitUrlPath(this._url.pathname);
    }

    /**
     *
     * @returns {ParsedData}
     */
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

      return new ParsedData(this._title, this._body);
    }

    /**
     *
     */
    #parsePreCommon() {}

    /**
     * Should be override.
     */
    parsePreCustom() {
      throw new Error(
        "Not Implemented Error: This method should be overrided."
      );
    }

    /**
     *
     */
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

    /**
     * Should be override.
     */
    parsePostCustom() {
      throw new Error(
        "Not Implemented Error: This method should be overrided."
      );
    }

    /**
     *
     */
    #parsePostCommon() {
      /* title */

      this._title += " (" + this._url.hostname + ")";
      this._body.unshift(this._title);

      /* body */

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

      /* 空白行の削除 */

      for (var i = 0; i < lines.length; ++i) {
        if (lines[i] !== undefined) {
          this._body.push(lines[i]);
        }
      }
    }
  }

  /**
   *
   */
  class OtherPageParser extends PageParser {
    /**
     *
     */
    parsePreCustom() {
      this._title += returnTitlePathPart(this._url.pathname);
    }

    /**
     *
     */
    parsePostCustom() {}
  }

  /**
   * atcoder.jp
   */
  class AtcoderJpPageParser extends PageParser {
    /**
     *
     */
    parsePreCustom() {
      this._title += " (" + this._urlPathList.slice(0, 2).join("/") + ")";
    }

    /**
     *
     */
    parsePostCustom() {}
  }

  /**
   * github.com
   * gitlab.com
   */
  class GitHubComPageParser extends PageParser {
    /**
     *
     */
    parsePreCustom() {
      switch (this._urlPathList.length) {
        case 0:
          return;
        case 1: {
          this.generatePageAtUserPage();
          return;
        }
        case 2: {
          this.generatePageAtReposRootPage();
          return;
        }
        default: {
          /**
           * let username = this._urlPathList[0];
           * let reposName = this._urlPathList[1];
           */
          let itemName = this._urlPathList[2];

          switch (itemName) {
            case "tree":
            case "blob": {
              this.generatePageAtBlobOrTreePage();
              return;
            }
            case "issues":
            default: {
              this.generatePageAtOtherPage();
              return;
            }
          }
        }
      }
    }

    /**
     *
     */
    parsePostCustom() {}

    /**
     *
     */
    generatePageAtUserPage() {
      let username = this._urlPathList[0];
      this._title = username;
    }

    /**
     *
     */
    generatePageAtReposRootPage() {
      let username = this._urlPathList[0];
      let reposName = this._urlPathList[1];

      this._title = username + "/" + reposName;
      this._body.push("[" + username + " (" + this._url.hostname + ")]");
    }

    /**
     *
     */
    generatePageAtBlobOrTreePage() {
      let username = this._urlPathList[0];
      let reposName = this._urlPathList[1];
      let itemName = this._urlPathList[2];

      this._title = this._urlPathList.join("/");

      this._body.push(
        "[" + username + "/" + reposName + " (" + this._url.hostname + ")]"
      );
    }

    /**
     *
     */
    generatePageAtOtherPage() {
      this._title += returnTitlePathPart(this._url.pathname);

      let path = this._urlPathList.slice(0, 2).join("/");
      this._body.push("[" + path + " (" + this._url.hostname + ")]");
    }
  }

  /**
   * gist.github.com
   */
  class GistGitHubComPageParser extends PageParser {
    /**
     *
     */
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

    /**
     *
     */
    parsePostCustom() {}
  }

  /**
   * qiita.com
   * zenn.com
   */
  class QiitaComPageParser extends PageParser {
    /**
     *
     */
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

    /**
     *
     */
    parsePostCustom() {}
  }

  /**
   * speackerdeck.com
   */
  class SpeackerdeckComPageParser extends PageParser {
    /**
     *
     */
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

    /**
     *
     */
    parsePostCustom() {}
  }

  /**
   *
   */
  class TwitterComPageParser extends PageParser {
    /**
     *
     */
    parsePreCustom() {}

    /**
     *
     */
    parsePostCustom() {
      getTwitterImageUrls(
        [].slice.call(this._document.querySelector("img"))
      ).forEach((url) => {
        this._body.push("[" + url.toString() + "]");
      });
    }
  }

  /**
   * www.youtube.com
   */
  class YouTubeComPageParser extends PageParser {
    /**
     *
     */
    preAtVideoPage() {
      let channelUrl = new URL(
        this._document
          .getElementById("above-the-fold")
          .querySelector("#top-row")
          .querySelector("#owner")
          .getElementsByTagName("a")[0].href
      );
      let channelName = this._document
        .getElementById("above-the-fold")
        .querySelector("#top-row")
        .querySelector("#owner")
        .querySelector("#upload-info")
        .querySelector("#channel-name")
        .querySelector("#container")
        .querySelector("#text-container")
        .querySelector("#text")
        .getElementsByTagName("a")[0].text;

      this._body.push(
        [
          "[",
          channelName,
          returnTitlePathPart(channelUrl.pathname),
          " (",
          this._url.hostname,
          ")]",
        ].join("")
      );
    }

    /**
     *
     */
    postAtVideoPage() {
      let video_id = this._url.searchParams.get("v");
      let thumbnail_image_url = new URL(
        ["https://img.youtube.com/vi/", video_id, "/maxresdefault.jpg"].join("")
      );

      this._body.push(
        "[" + this._url.toString() + "]",
        "[" + thumbnail_image_url.toString() + "]"
      );
    }

    /**
     *
     */
    postAtUserPage() {
      let channelName = this._document
        .getElementById("channel-container")
        .querySelector("#channel-header")
        .querySelector("#channel-header-container")
        .querySelector("#inner-header-container")
        .querySelector("#meta")
        .querySelector("#container")
        .querySelector("#text-container")
        .querySelector("#text").innerHTML;
      let channelId = this._urlPathList[0];
      let channelUrl = new URL(this._url.origin + "/" + channelId);

      this._title = [
        channelName,
        returnTitlePathPart(channelUrl.pathname),
      ].join("");

      let imageUrl = new URL(
        this._document
          .getElementById("channel-container")
          .querySelector("#channel-header")
          .querySelector("#channel-header-container")
          .querySelector("#avatar")
          .querySelector("#img").src
      );
      this._body.push("[" + imageUrl.toString() + "#.jpg]");
    }

    /**
     *
     * @returns
     */
    parsePreCustom() {
      switch (this._urlPathList[0]) {
        case "watch": {
          this.preAtVideoPage();
          return;
        }
      }

      console.log("debug: no processing.");
    }

    /**
     *
     * @returns
     */
    parsePostCustom() {
      switch (this._urlPathList[0]) {
        case "watch": {
          /* video url */
          this.postAtVideoPage();
          return;
        }

        default: {
          if (this._urlPathList[0].slice(0, 1) == "@") {
            this.postAtUserPage();
            return;
          }
        }
      }

      console.log("debug: no processing.");
    }
  }

  /* End PageParser Classes */

  /**
   *
   * @param {string} title
   * @param {URL} this_page_url
   * @param {Document} document
   * @returns
   */
  function parsePage(title, this_page_url, document) {
    let tmpBody = [];
    let data = null;
    console.log("parsePage");
    switch (this_page_url.hostname) {
      case "atcoder.jp": {
        return new AtcoderJpPageParser(title, this_page_url, document).do();
      }
      case "github.com":
      case "gitlab.com": {
        return new GitHubComPageParser(title, this_page_url, document).do();
      }

      case "gist.github.com": {
        return new GistGitHubComPageParser(title, this_page_url, document).do();
      }

      case "speakerdeck.com": {
        /* https://speakerdeck.com/<username>/<title> */
        return new SpeackerdeckComPageParser(
          title,
          this_page_url,
          document
        ).do();
      }

      case "qiita.com":
      case "zenn.dev": {
        /**
         *
         * https://qiita.com/<username>/items/<uuid>
         * https://zenn.dev/<username>/articles/<uuid>
         */
        return new QiitaComPageParser(title, this_page_url, document).do();
      }

      case "twitter.com":
      case "mobile.twitter.com": {
        return new TwitterComPageParser(title, this_page_url, document).do();
      }

      case "www.youtube.com": {
        return new YouTubeComPageParser(title, this_page_url, document).do();
      }

      default: {
        return new OtherPageParser(title, this_page_url, document).do();
      }
    }
    throw new Error("No returns");
  }

  const date = new Date();

  {
    let this_page_url = new URL(window.location.href);
    let title = window.prompt("Bookmark to Scrapbox", document.title);
    if (title == null) return;
    /* replace special characters */
    title = title.replaceAll("[", "").replaceAll("]", "");
    /* replace backquote */
    title = title.replaceAll("`", "");
    /* replace first slash (/) */
    title = title.replace(/^\//, "\\/");
    /* remove url from title */
    title = title.replaceAll(/(https?:\/\/[^ ]*)/g, "");

    let data = parsePage(title, this_page_url, document);

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
