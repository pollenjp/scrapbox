javascript: (function () {
  let project_name = "pollenJP-Memo";

  /**
   * data class
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
    return ` (${decodeURI(path)})`;
  }

  /**
   *
   * @param {string} title
   * @param {string} hostname
   * @returns {string}
   */
  function safeWrapTitle(title, hostname) {
    if (title.endsWith(`(${hostname})`)) {
      return title;
    }

    return `${title} (${hostname})`;
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

  /**
   *
   * @param {Element} htmlElement
   * @param {string} tagName
   * @returns
   */
  function getChildElementByTagName(htmlElement, tagName) {
    tagName = tagName.toUpperCase();

    for (const element of htmlElement.children) {
      if (element.tagName == tagName) {
        return element;
      }
    }
    console.log(htmlElement);
    throw new Error(`Element not found: ${tagName} ${htmlElement}`);
  }

  /**
   *
   * @param {Element} htmlElement
   * @param {string} tagName
   * @param {string} id
   * @returns
   */
  function getChildElementByTagNameAndId(htmlElement, tagName, id) {
    tagName = tagName.toUpperCase();

    for (const element of htmlElement.children) {
      if (element.tagName !== tagName) {
        continue;
      }
      if (element.id === id) {
        return element;
      }
    }
    console.log(htmlElement);
    throw new Error(`Element not found: ${tagName} ${id} ${htmlElement}`);
  }

  /**
   *
   * @param {Element} htmlElement
   * @param {string} tagName
   * @param {string[]} classList
   * @returns
   */
  function getChildElementByTagNameAndClass(htmlElement, tagName, classList) {
    tagName = tagName.toUpperCase();

    for (const element of htmlElement.children) {
      if (element.tagName !== tagName) {
        continue;
      }

      let is_match = true;
      for (const className of classList) {
        if (!element.classList.contains(className)) {
          is_match = false;
          break;
        }
      }

      if (is_match) {
        return element;
      }
    }

    console.log(htmlElement);
    throw new Error(`Element not found: ${tagName} ${classList}`);
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
        `[${this._url.hostname}]`,
        `Scrap at [date${date.format("yyyy-MM-dd")}]`,
        "",
        `\`${this._document.title}\``,
        `${this._url.toString()}`,
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

      this._title = safeWrapTitle(this._title, this._url.hostname);
      this._body.unshift(this._title);

      /* body */

      let quote = window.getSelection().toString();
      let lines = [];
      if (quote.trim()) {
        lines.push(
          quote.split(/\n/g).map(function (line) {
            if (line !== "") {
              return `  > ${line}`;
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
      this._title += ` (${this._urlPathList.slice(0, 2).join("/")})`;
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

      this._title = `${username}/${reposName}`;
      this._body.push(`[${safeWrapTitle(username, this._url.hostname)}]`);
    }

    /**
     *
     */
    generatePageAtBlobOrTreePage() {
      let username = this._urlPathList[0];
      let reposName = this._urlPathList[1];
      let itemName = this._urlPathList[2];

      this._title = this._urlPathList.join("/");

      let userPageTitle = safeWrapTitle(
        `${username}/${reposName}`,
        this._url.hostname
      );
      this._body.push(`[${userPageTitle}]`);
    }

    /**
     *
     */
    generatePageAtOtherPage() {
      this._title += returnTitlePathPart(this._url.pathname);

      let path = this._urlPathList.slice(0, 2).join("/");
      this._body.push(`[${safeWrapTitle(path, this._url.hostname)}]`);
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
          this._body.push(`[${safeWrapTitle(username, this._url.hostname)}]`);
          break;
        }
        default: {
          alert(`Failed: ${this._urlPathList}`);
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
          this._body.push(`[${safeWrapTitle(username, this._url.hostname)}]`);
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
  class SpeakerdeckComPageParser extends PageParser {
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
          this._body.push(`[${safeWrapTitle(username, this._url.hostname)}]`);
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
   * www.twitter.com
   */
  class TwitterComPageParser extends PageParser {
    /**
     *
     */
    parsePreCustom() {
      switch (this._urlPathList.length) {
        case 0: {
          return;
        }
        case 1: {
          this.parseUserPage();
          return;
        }
        default: {
          this.parseTweetPage();
          return;
        }
      }
    }

    /**
     *
     */
    parsePostCustom() {
      getTwitterImageUrls(
        [].slice.call(this._document.querySelectorAll("img"))
      ).forEach((url) => {
        this._body.push(`[${url.toString()}]`);
      });
    }

    parseUserPage() {
      let username = TwitterComPageParser.parseUserNameFromUrlPath(
        this._url.pathname
      );
      this._title = TwitterComPageParser.getUserPageTitle(username);
      this._body.push(`[Twitter User Page]`);
    }

    parseTweetPage() {
      let username = TwitterComPageParser.parseUserNameFromUrlPath(
        this._url.pathname
      );

      this._title = `${this._title}${returnTitlePathPart(this._url.pathname)}`;
      this._body.push(
        `[${safeWrapTitle(
          TwitterComPageParser.getUserPageTitle(username),
          this._url.hostname
        )}]`
      );
    }

    /**
     *
     * @param {string} username
     * @returns {string}
     */
    static getUserPageTitle(username) {
      return `${username} (/${username})`;
    }

    /**
     *
     * @param {string} path
     * @returns {string}
     */
    static parseUserNameFromUrlPath(path) {
      let urlPathArray = splitUrlPath(path);
      if (urlPathArray.length < 1) {
        alert(`Failed to get user from ${path}`);
      }
      return urlPathArray[0];
    }
  }

  /**
   * www.youtube.com
   */
  class YouTubeComPageParser extends PageParser {
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
        case "playlist": {
          this.preAtPlaylistPage();
          return;
        }
        default: {
          /* user page */
          this._body.push(`[YouTube User Page]`);
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

        case "playlist": {
          this.postAtPlaylistPage();
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
      let channelId = splitUrlPath(channelUrl.pathname).slice(-1);
      let videoId = this._url.searchParams.get("v");
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

      let d =
        YouTubeComPageParser.extractVideoUploadDateFromVideoPage(
          document
        ).format("yyyy-MM-dd");
      this._title = `${d} ${this._title} (${videoId}) (${channelId})`;
      this._body.push(
        `[${channelName}${returnTitlePathPart(channelUrl.pathname)} (${
          this._url.hostname
        })]`
      );
    }

    /**
     *
     */
    postAtVideoPage() {
      let videoId = this._url.searchParams.get("v");
      let thumbnailImageUrl = new URL(
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      );

      this._body.push(
        `[${this._url.toString()}]`,
        `[${thumbnailImageUrl.toString()}]`
      );
    }

    /**
     *
     */
    preAtPlaylistPage() {
      /**
       * @param {Element} root
       * @returns {string}
       */
      function getPlaylistName(root) {
        let element = root;
        element = getChildElementByTagName(element, "body");
        element = getChildElementByTagName(element, "ytd-app");
        element = getChildElementByTagNameAndId(element, "div", "content");
        element = getChildElementByTagName(element, "ytd-page-manager");
        element = getChildElementByTagName(element, "ytd-browse");
        element = getChildElementByTagName(
          element,
          "ytd-playlist-header-renderer"
        );
        element = getChildElementByTagNameAndClass(element, "div", [
          "immersive-header-container",
          "style-scope",
          "ytd-playlist-header-renderer",
        ]);
        element = getChildElementByTagNameAndClass(element, "div", [
          "immersive-header-content",
          "style-scope",
          "ytd-playlist-header-renderer",
        ]);
        element = getChildElementByTagNameAndClass(element, "div", [
          "thumbnail-and-metadata-wrapper",
          "style-scope",
          "ytd-playlist-header-renderer",
        ]);
        element = getChildElementByTagNameAndClass(element, "div", [
          "metadata-wrapper",
          "style-scope",
          "ytd-playlist-header-renderer",
        ]);
        element = getChildElementByTagName(
          element,
          "yt-dynamic-sizing-formatted-string"
        );
        element = getChildElementByTagNameAndId(element, "div", "container");
        element = getChildElementByTagNameAndId(
          element,
          "yt-formatted-string",
          "text"
        );
        console.log(element);
        return element.innerText;
      }
      let playlistName = getPlaylistName(this._document.documentElement);

      /**
       * @param {Element} root
       * @returns {[string, URL]}
       */
      function getChannelNameAndURL(root) {
        let element = root;
        element = getChildElementByTagName(element, "body");
        element = getChildElementByTagName(element, "ytd-app");
        element = getChildElementByTagNameAndId(element, "div", "content");
        element = getChildElementByTagName(element, "ytd-page-manager");
        element = getChildElementByTagName(element, "ytd-browse");
        element = getChildElementByTagName(
          element,
          "ytd-playlist-header-renderer"
        );
        element = getChildElementByTagNameAndClass(element, "div", [
          "immersive-header-container",
          "style-scope",
          "ytd-playlist-header-renderer",
        ]);
        element = getChildElementByTagNameAndClass(element, "div", [
          "immersive-header-content",
          "style-scope",
          "ytd-playlist-header-renderer",
        ]);
        element = getChildElementByTagNameAndClass(element, "div", [
          "thumbnail-and-metadata-wrapper",
          "style-scope",
          "ytd-playlist-header-renderer",
        ]);
        element = getChildElementByTagNameAndClass(element, "div", [
          "metadata-wrapper",
          "style-scope",
          "ytd-playlist-header-renderer",
        ]);
        element = getChildElementByTagNameAndClass(element, "div", [
          "metadata-action-bar",
          "style-scope",
          "ytd-playlist-header-renderer",
        ]);
        element = getChildElementByTagNameAndClass(element, "div", [
          "metadata-text-wrapper",
          "style-scope",
          "ytd-playlist-header-renderer",
        ]);
        element = getChildElementByTagNameAndClass(element, "div", [
          "metadata-owner",
          "style-scope",
          "ytd-playlist-header-renderer",
        ]);
        element = getChildElementByTagNameAndId(
          element,
          "yt-formatted-string",
          "owner-text"
        );
        element = getChildElementByTagName(element, "a");
        return [element.text, new URL(element.href)];
      }

      /**
       * @type {string}
       */
      let channelName;
      /**
       * @type {URL}
       */
      let channelUrl;
      [channelName, channelUrl] = getChannelNameAndURL(
        this._document.documentElement
      );

      console.log(channelName, channelUrl);

      let playlistId = this._url.searchParams.get("list");
      let channelId = splitUrlPath(channelUrl.pathname).slice(-1);

      this._title = `${playlistName} (playlist:${playlistId}) (${channelId})`;
      this._body.push(
        `[${channelName}${returnTitlePathPart(channelUrl.pathname)} (${
          this._url.hostname
        })]`
      );
    }

    /**
     *
     */
    postAtPlaylistPage() {
      let videoId = this._url.searchParams.get("v");

      this._body.push(`[${this._url.toString()}]`);
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
      let channelUrl = new URL(`${this._url.origin}/${channelId}`);

      this._title = `${channelName}${returnTitlePathPart(channelUrl.pathname)}`;

      let imageUrl = new URL(
        this._document
          .getElementById("channel-container")
          .querySelector("#channel-header")
          .querySelector("#channel-header-container")
          .querySelector("#avatar")
          .querySelector("#img").src
      );
      this._body.push(`[${imageUrl.toString()}#.jpg]`);
    }

    /**
     *
     * @param {Document} document
     * @returns {Date}
     */
    static extractVideoUploadDateFromVideoPage(document) {
      let t = document
        .getElementById("columns")
        .querySelector("#primary")
        .querySelector("#primary-inner")
        .querySelector("#above-the-fold")
        .querySelector("#bottom-row")
        .querySelector("#description")
        .querySelector("#description-inner")
        .querySelector("#tooltip").textContent;

      {
        /* '\n  4,056 回視聴 • 2022/03/21\n' */
        let regex = /.*• (?<date>[0-9]{4}\/[0-9]{2}\/[0-9]{2}).*/;
        let match = regex.exec(t);

        if (match != null) {
          return new Date(
            /* 2011/01/32 */
            match.groups.date
          );
        }
      }

      {
        /* 563 回視聴 • 14 時間前にライブ配信 */
        let regex = /.*• (?<hour>[0-9]{2}) 時間前.*/;
        let match = regex.exec(t);
        if (match != null) {
          let hour = match.groups.hour;
          let d = new Date();
          d.setHours(d.getHours() - hour);
          return d;
        }
      }

      return new Date();
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
        return new SpeakerdeckComPageParser(
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
      `https://scrapbox.io/${encodeURIComponent(
        project_name
      )}/${encodeURIComponent(data.title.trim())}?body=${encodeURIComponent(
        data.body.join("\n")
      )}`
    );
  }
})();
