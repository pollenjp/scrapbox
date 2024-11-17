const project_name = "pollenJP-Memo"

/**
 * data class
 */
class ParsedData {
  private _title: string
  private _body: string[]

  constructor(title: string, body: string[]) {
    this._title = title
    this._body = body
  }

  get title() {
    return this._title
  }

  get body() {
    return this._body
  }
}

/*************************
 * Define Util Functions *
 *************************/

function format(d: Date, format: string): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return format
    .replace("ddd", days[d.getDay()])
    .replace("yyyy", `${d.getFullYear()}`)
    .replace("MM", `0${d.getMonth() + 1}`.slice(-2))
    .replace("dd", `0${d.getDate()}`.slice(-2))
    .replace("hh", `0${d.getHours()}`.slice(-2))
    .replace("mm", `0${d.getMinutes()}`.slice(-2))
    .replace("ss", `0${d.getSeconds()}`.slice(-2))
}

/**
 * ex) /aaa/bbb/ccc => ["aaa", "bbb", "ccc"]
 */
function splitUrlPath(urlPath: string): string[] {
  let pathList = urlPath.split("/").slice(1)
  if (pathList.slice(-1)[0].length == 0) {
    pathList = pathList.slice(0, -1)
  }
  return pathList
}

/**
 * scrapbox に生成するページのタイトルのうち URL path の部分を生成する.
 */
function returnTitlePathPart(path: string): string {
  if (path.length == 1) {
    /* ルートパスの時は空文字を返す */
    return ""
  }
  return ` (${decodeURI(path)})`
}

/**
 *
 */
function safeWrapTitle(title: string, hostname: string) {
  if (title.endsWith(`(${hostname})`)) {
    return title
  }

  return `${title} (${hostname})`
}

function getTwitterImageUrls(imageElems: HTMLImageElement[]): URL[] {
  const imgUrls: URL[] = []
  imageElems.forEach(function (imgElem) {
    if (imgElem.alt == "Image" || imgElem.alt == "画像") {
      const img_url = new URL(imgElem.src)
      imgUrls.push(new URL(`${img_url.origin}${img_url.pathname}.jpg`))
    }
  })
  return imgUrls
}

/**
 * YouTube の `@username` から Scrapbox 上で紐づけるための一意なタイトルを生成する
 */
function generateYouTubeUserPageTitle(userId: string): string {
  return `${userId} (www.youtube.com)`
}

/**
 * get the first element having the specified tag name
 */
function getChildElementByTagName(element: Element, tagName: string): Element {
  tagName = tagName.toUpperCase()

  for (const elem of element.children) {
    if (elem.tagName == tagName) {
      return elem
    }
  }
  console.log("==== element ===")
  console.log(element)
  console.log("==== element.children ===")
  console.log(element.children)
  throw new Error(`Element not found: ${tagName} ${element}`)
}

type GetChildElementByTagNameAndIdParams = {
  tagName: string
  id: string
}

interface Element {
  getChildElementByTagNameAndId(params: GetChildElementByTagNameAndIdParams): Element
}

Element.prototype.getChildElementByTagNameAndId = function (params) {
  const tagName = params.tagName.toUpperCase()
  for (const elem of this.children) {
    if (elem.tagName !== tagName) {
      continue
    }
    if (elem.id === params.id) {
      return elem
    }
  }
  console.log(this)
  throw new Error(`Element not found: ${tagName} ${params.id} ${this}`)
}

type GetChildElementByTagNameAndIdParamsv1 = {
  element: Element
  tagName: string
  id: string
}

function getChildElementByTagNameAndId(params: GetChildElementByTagNameAndIdParamsv1): Element {
  const tagName = params.tagName.toUpperCase()
  for (const elem of params.element.children) {
    if (elem.tagName !== tagName) {
      continue
    }
    if (elem.id === params.id) {
      return elem
    }
  }
  console.log(params.element)
  throw new Error(`Element not found: ${tagName} ${params.id} ${params.element}`)
}

function getChildElementByTagNameAndClass(
  element: Element,
  tagName: string,
  classList: string[]
): Element {
  tagName = tagName.toUpperCase()

  for (const elem of element.children) {
    if (elem.tagName !== tagName) {
      continue
    }

    let is_match = true
    for (const className of classList) {
      if (!elem.classList.contains(className)) {
        is_match = false
        break
      }
    }

    if (is_match) {
      return elem
    }
  }

  console.log(element)
  throw new Error(`Element not found: ${tagName} ${classList}`)
}

function getChildElementByTagNameAndAttribute(
  element: Element,
  tagName: string,
  attributeName: string
): Element {
  tagName = tagName.toUpperCase()

  for (const elem of element.children) {
    if (elem.tagName !== tagName) {
      continue
    }
    if (elem.getAttribute(attributeName) !== null) {
      return elem
    }
  }
  console.log(element)
  throw new Error(`Element not found: ${tagName} / ${attributeName} / ${element}`)
}

const getDeepTextContent = (element: HTMLElement): string => {
  let text = ""
  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      text += getDeepTextContent(child as HTMLElement)
    }
  }
  return text.trim()
}

/* End Define Functions */

/***************
 * Page Parser *
 ***************/

/**
 * Base Class
 */
class PageParser {
  protected _title: string
  protected _body: string[] = []
  protected _url: URL
  protected _document: Document
  /**
   * Url Path List
   * @description
   *   "https://github.com/pollenjp/scrapbox/tree/0d4300fae19958c6726653d88f0c68982450b647/bookmarklet";
   *   => [
   *   'pollenjp',
   *   'scrapbox',
   *   '0d4300fae19958c6726653d88f0c68982450b647',
   *   'bookmarklet',
   *   ]
   */
  protected _urlPathList: string[]

  constructor(title: string, url: URL, document: Document) {
    this._title = title
    this._url = url
    this._document = document
    this._urlPathList = splitUrlPath(this._url.pathname).map((path) => decodeURIComponent(path))
  }

  do(): ParsedData {
    this.#parsePreCommon()
    console.log("parsePreCustom")
    this.parsePreCustom()
    this.#parseMiddleCommon()
    console.log("parsePostCustom")
    this.parsePostCustom()
    this.#parsePostCommon()

    return new ParsedData(this._title, this._body)
  }

  /**
   *
   */
  #parsePreCommon() {
    console.log("parsePreCommon")
  }

  /**
   * Should be override.
   */
  parsePreCustom() {
    throw new Error("Not Implemented Error: This method should be overridden.")
  }

  /**
   *
   */
  #parseMiddleCommon() {
    console.log("parseMiddleCommon")

    this._body.push(
      `[${this._url.hostname}]`,
      `Scrap at [date${format(d, "yyyy-MM-dd")}]`,
      "",
      `\`${this._document.title}\``,
      `${this._url.toString()}`,
      ""
    )
  }

  /**
   * Should be override.
   */
  parsePostCustom() {
    throw new Error("Not Implemented Error: This method should be overrided.")
  }

  /**
   *
   */
  #parsePostCommon() {
    console.log("parsePostCommon")

    /* title */

    this._title = safeWrapTitle(this._title, this._url.hostname)
    this._body.unshift(this._title)

    /* body */

    const s = window.getSelection()
    const quote = s !== null ? s.toString() : ""

    let quoteLines: (string | null)[] = []
    if (quote.trim()) {
      /* 空白行を null に置き換える */
      quoteLines = quote.split(/\n/g).map(function (line: string) {
        if (line !== "") {
          return `  > ${line}`
        }
        return null
      })
    }

    /* 空白行 (null) の削除 */

    for (let i = 0; i < quoteLines.length; ++i) {
      quoteLines.forEach((line) => {
        if (line !== null) {
          this._body.push(line)
        }
      })
    }
  }
}

class OtherPageParser extends PageParser {
  parsePreCustom() {
    this._title += returnTitlePathPart(this._url.pathname)
  }
  parsePostCustom() {
    console.log("parsePostCustom")
  }
}

/**
 * atcoder.jp
 */
class AtcoderJpPageParser extends PageParser {
  parsePreCustom() {
    this._title += ` (${this._urlPathList.slice(0, 2).join("/")})`
  }
}

/**
 * github.com
 * gitlab.com
 */
class GitHubComPageParser extends PageParser {
  parsePreCustom() {
    switch (this._urlPathList.length) {
      case 0:
        return
      case 1: {
        this.generatePageAtUserPage()
        return
      }
      case 2: {
        this.generatePageAtReposRootPage()
        return
      }
      default: {
        /**
         * let username = this._urlPathList[0];
         * let reposName = this._urlPathList[1];
         */
        const itemName = this._urlPathList[2]

        switch (itemName) {
          case "tree":
          case "blob": {
            this.generatePageAtBlobOrTreePage()
            return
          }
          case "issues":
          default: {
            this.generatePageAtOtherPage()
            return
          }
        }
      }
    }
  }

  parsePostCustom() {
    console.log("parsePostCustom")
  }

  /**
   *
   */
  generatePageAtUserPage() {
    const username = this._urlPathList[0]
    this._title = username
  }

  /**
   *
   */
  generatePageAtReposRootPage() {
    const username = this._urlPathList[0]
    const reposName = this._urlPathList[1]

    this._title = `${username}/${reposName}`
    this._body.push(`[${this._url.hostname}/${username}/${reposName}]`)
    this._body.push(`[${safeWrapTitle(username, this._url.hostname)}]`)
  }

  /**
   *
   */
  generatePageAtBlobOrTreePage() {
    const username = this._urlPathList[0]
    const reposName = this._urlPathList[1]

    this._title = this._urlPathList.join("/")

    const userPageTitle = safeWrapTitle(`${username}/${reposName}`, this._url.hostname)
    this._body.push(`[${userPageTitle}]`)
  }

  /**
   *
   */
  generatePageAtOtherPage() {
    this._title += returnTitlePathPart(this._url.pathname)

    const path = this._urlPathList.slice(0, 2).join("/")
    this._body.push(`[${safeWrapTitle(path, this._url.hostname)}]`)
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
        break
      case 1: {
        const username = this._urlPathList[0]
        this._title = username
        break
      }
      case 2: {
        const username = this._urlPathList[0]

        this._title = this._urlPathList.join("/")
        this._body.push(`[${safeWrapTitle(username, this._url.hostname)}]`)
        break
      }
      default: {
        alert(`Failed: ${this._urlPathList}`)
      }
    }
  }

  parsePostCustom() {
    console.log("parsePostCustom")
  }
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
    const username = this._urlPathList[0]
    switch (this._urlPathList.length) {
      case 1:
        this._title = username
        break
      case 3:
        this._title += returnTitlePathPart(this._url.pathname)
        this._body.push(`[${safeWrapTitle(username, this._url.hostname)}]`)
        break
      default:
        this._title += returnTitlePathPart(this._url.pathname)
    }
  }

  parsePostCustom() {
    console.log("parsePostCustom")
  }
}

/**
 * speackerdeck.com
 */
class SpeakerdeckComPageParser extends PageParser {
  /**
   *
   */
  parsePreCustom() {
    const username = this._urlPathList[0]
    switch (this._urlPathList.length) {
      case 1: {
        this._title = username
        break
      }
      case 2: {
        this._title += returnTitlePathPart(this._url.pathname)
        this._body.push(`[${safeWrapTitle(username, this._url.hostname)}]`)
        break
      }
    }
  }

  parsePostCustom() {
    console.log("parsePostCustom")
  }
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
        return
      }
      case 1: {
        this.parseUserPage()
        return
      }
      default: {
        this.parseTweetPage()
        return
      }
    }
  }

  /**
   *
   */
  parsePostCustom() {
    getTwitterImageUrls([].slice.call(this._document.querySelectorAll("img"))).forEach((url) => {
      this._body.push(`[${url.toString()}]`)
    })
  }

  parseUserPage() {
    const username = TwitterComPageParser.parseUserNameFromUrlPath(this._url.pathname)
    this._title = TwitterComPageParser.getUserPageTitle(username)
    this._body.push(`[Twitter User Page]`)
  }

  parseTweetPage() {
    const username = TwitterComPageParser.parseUserNameFromUrlPath(this._url.pathname)

    this._title = `${this._title}${returnTitlePathPart(this._url.pathname)}`
    this._body.push(
      `[${safeWrapTitle(TwitterComPageParser.getUserPageTitle(username), this._url.hostname)}]`
    )
  }

  static getUserPageTitle(username: string): string {
    return `${username} (/${username})`
  }

  /**
   *
   */
  static parseUserNameFromUrlPath(path: string): string {
    const urlPathArray = splitUrlPath(path)
    if (urlPathArray.length < 1) {
      alert(`Failed to get user from ${path}`)
    }
    return decodeURIComponent(urlPathArray[0])
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
      case "watch":
      case "live": {
        /* https://www.youtube.com/live/HilaOz31AfU */
        this.preAtWatchOrLivePage({ pageType: this._urlPathList[0] })
        return
      }
      case "playlist": {
        this.preAtPlaylistPage()
        return
      }
      case "shorts": {
        /* ex) <https://www.youtube.com/shorts/0V7LPbjRDqk> */
        this.preAtShortsPage()
        return
      }
      default: {
        if (this._urlPathList[0].slice(0, 1) == "@") {
          /* user page */
          this.preAtUserPage()
        } else {
          throw new Error("Not Supported URI")
        }
      }
    }

    console.log("debug: no processing.")
  }

  /**
   *
   * @returns
   */
  parsePostCustom() {
    switch (this._urlPathList[0]) {
      case "watch": {
        /* video url */
        this.postAtVideoPage()
        return
      }

      case "playlist": {
        this.postAtPlaylistPage()
        return
      }

      case "shorts": {
        this.postAtShortsPage()
        return
      }

      default: {
        if (this._urlPathList[0].slice(0, 1) == "@") {
          /* user page */
          this.postAtUserPage()
          return
        }
      }
    }

    console.log("debug: no processing.")
  }

  /**
   * example:
   * https://www.youtube.com/watch?v=MjcyTIB9nz0&list=PLjFz-Ge41_es-0slEmGltRLp6Ym6gtunZ&index=3
   */
  static extractVideoIdFromWatchUrl(url: URL): string {
    const videoId = url.searchParams.get("v")
    if (videoId === null) {
      throw new Error(`Failed to get video id from the url (${url})`)
    }
    return videoId
  }

  /**
   * example:
   * https://www.youtube.com/live/Cpn0ZIcHz-w
   */
  static extractVideoIdFromLiveUrl(url: URL): string {
    const videoId = splitUrlPath(url.pathname).at(-1)
    if (videoId === undefined) {
      throw new Error(`Failed to get video id from the url (${url})`)
    }
    return videoId
  }

  /**
   *
   */
  preAtWatchOrLivePage({ pageType }: { pageType: "watch" | "live" }) {
    const videoId =
      pageType === "watch"
        ? YouTubeComPageParser.extractVideoIdFromWatchUrl(this._url)
        : YouTubeComPageParser.extractVideoIdFromLiveUrl(this._url)

    let channelUrl: URL
    {
      const elem = this._document
        ?.getElementById("above-the-fold")
        ?.querySelector("#top-row")
        ?.querySelector("#owner")
        ?.getElementsByTagName("a")
      if (elem === undefined) {
        throw new Error("Failed to get channel url")
      }
      channelUrl = new URL(elem[0].href)
    }

    const channelId = decodeURIComponent(
      splitUrlPath(channelUrl.pathname).at(-1) ||
        (() => {
          throw new Error("Failed to get channel id")
        })()
    )
    const ds = format(
      YouTubeComPageParser.extractVideoUploadDateFromVideoPage(document),
      "yyyy-MM-dd"
    )
    this._title = `${ds} ${this._title} (${videoId}) (${channelId})`
    this._body.push(`[${generateYouTubeUserPageTitle(channelId)}]`)
  }

  /**
   *
   */
  postAtVideoPage() {
    const videoId = YouTubeComPageParser.extractVideoIdFromWatchUrl(this._url)
    const thumbnailImageUrl = new URL(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)

    this._body.push(`[${this._url.toString()}]`, `[${thumbnailImageUrl.toString()}]`)
  }

  /**
   *
   */
  preAtPlaylistPage() {
    /**
     * @param {Element} root
     * @returns {string}
     */
    function getPlaylistName(root: Element) {
      let element = root
      element = getChildElementByTagName(element, "body")
      element = getChildElementByTagName(element, "ytd-app")
      element = getChildElementByTagNameAndId({
        element: element,
        tagName: "div",
        id: "content"
      })
      element = getChildElementByTagName(element, "ytd-page-manager")
      element = getChildElementByTagName(element, "ytd-browse")
      element = getChildElementByTagName(element, "ytd-playlist-header-renderer")
      element = getChildElementByTagNameAndClass(element, "div", [
        "immersive-header-container",
        "style-scope",
        "ytd-playlist-header-renderer"
      ])
      element = getChildElementByTagNameAndClass(element, "div", [
        "immersive-header-content",
        "style-scope",
        "ytd-playlist-header-renderer"
      ])
      element = getChildElementByTagNameAndClass(element, "div", [
        "thumbnail-and-metadata-wrapper",
        "style-scope",
        "ytd-playlist-header-renderer"
      ])
      element = getChildElementByTagNameAndClass(element, "div", [
        "metadata-wrapper",
        "style-scope",
        "ytd-playlist-header-renderer"
      ])
      element = getChildElementByTagName(element, "yt-dynamic-sizing-formatted-string")
      element = getChildElementByTagNameAndId({
        element: element,
        tagName: "div",
        id: "container"
      })
      element = getChildElementByTagNameAndId({
        element: element,
        tagName: "yt-formatted-string",
        id: "text"
      })
      console.log(element)
      if (element instanceof HTMLElement) {
        return element.innerText
      }
      throw new Error(`Failed to get playlist name. the element is not HTMLElement. (${element})`)
    }

    const playlistName = getPlaylistName(this._document.documentElement)

    interface ChannelInfo {
      name: string
      url: URL
    }

    function getChannelNameAndURL(root: Element): ChannelInfo {
      let element = root
      element = getChildElementByTagName(element, "body")
      element = getChildElementByTagName(element, "ytd-app")
      element = getChildElementByTagNameAndId({
        element: element,
        tagName: "div",
        id: "content"
      })
      element = getChildElementByTagName(element, "ytd-page-manager")
      element = getChildElementByTagName(element, "ytd-browse")
      element = getChildElementByTagName(element, "ytd-playlist-header-renderer")
      element = getChildElementByTagNameAndClass(element, "div", [
        "immersive-header-container",
        "style-scope",
        "ytd-playlist-header-renderer"
      ])
      element = getChildElementByTagNameAndClass(element, "div", [
        "immersive-header-content",
        "style-scope",
        "ytd-playlist-header-renderer"
      ])
      element = getChildElementByTagNameAndClass(element, "div", [
        "thumbnail-and-metadata-wrapper",
        "style-scope",
        "ytd-playlist-header-renderer"
      ])
      element = getChildElementByTagNameAndClass(element, "div", [
        "metadata-wrapper",
        "style-scope",
        "ytd-playlist-header-renderer"
      ])
      element = getChildElementByTagNameAndClass(element, "div", [
        "metadata-action-bar",
        "style-scope",
        "ytd-playlist-header-renderer"
      ])
      element = getChildElementByTagNameAndClass(element, "div", [
        "metadata-text-wrapper",
        "style-scope",
        "ytd-playlist-header-renderer"
      ])
      element = getChildElementByTagNameAndClass(element, "div", [
        "metadata-owner",
        "style-scope",
        "ytd-playlist-header-renderer"
      ])
      element = getChildElementByTagNameAndId({
        element: element,
        tagName: "yt-formatted-string",
        id: "owner-text"
      })
      element = getChildElementByTagName(element, "a")
      if (!(element instanceof HTMLAnchorElement)) {
        throw new Error(
          `Failed to get channel name and url. the element is not HTMLAnchorElement. (${element})`
        )
      }
      return { name: element.text, url: new URL(element.href) }
    }

    const channelInfo = getChannelNameAndURL(this._document.documentElement)

    console.log(channelInfo.name, channelInfo.url)

    const playlistId = this._url.searchParams.get("list")
    if (playlistId === null) {
      throw new Error("Failed to get playlist id.")
    }

    const channelId = decodeURIComponent(
      splitUrlPath(channelInfo.url.pathname).at(-1) ||
        (() => {
          throw new Error("Failed to get channel id")
        })()
    )

    this._title = `${playlistName} (playlist:${playlistId}) (${channelId})`
    this._body.push(`[${generateYouTubeUserPageTitle(channelId)}]`)
  }

  /**
   *
   */
  postAtPlaylistPage() {
    this._body.push(`[${this._url.toString()}]`)
  }

  /**
   *
   */
  preAtShortsPage() {
    const channelUrl = new URL(
      (
        this._document.getElementsByClassName(
          "yt-core-attributed-string__link"
        )[0] as HTMLAnchorElement
      ).href
    )
    const channelId = decodeURIComponent(
      splitUrlPath(channelUrl.pathname).at(0) ||
        (() => {
          throw new Error("Failed to get channel id")
        })()
    )

    this._title = `${this._document.title}${returnTitlePathPart(this._url.pathname)}`
    this._body.push(`[${generateYouTubeUserPageTitle(channelId)}]`)
  }

  /**
   *
   */
  postAtShortsPage() {
    const videoId = this._urlPathList.at(-1)
    if (videoId === undefined) {
      throw new Error("Failed to get video id.")
    }

    const thumbnailImageUrl = new URL(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)

    this._body.push(`[${thumbnailImageUrl.toString()}]`)
  }

  /**
   *
   * @returns {{channelName: string, channelId: string, channelUrl: URL}}
   */
  getChannelInfoAtUserPage() {
    const channelName = getDeepTextContent(
      this._document.getElementsByClassName(
        "page-header-view-model-wiz__page-header-title"
      )[0] as HTMLElement
    )
    const channelId =
      (
        (
          this._document.querySelector(
            ".page-header-view-model-wiz__page-header-content-metadata"
          ) as HTMLElement
        ).querySelector(
          "div.yt-content-metadata-view-model-wiz__metadata-row span.yt-core-attributed-string"
        ) as HTMLElement
      ).textContent ||
      (() => {
        throw new Error("Failed to get channel id.")
      })()
    type ChannelInfo = {
      channelName: string
      channelId: string
      channelUrl: URL
    }
    const ret: ChannelInfo = {
      channelName: channelName,
      channelId: channelId,
      channelUrl: new URL(`${this._url.origin}/${channelId}`)
    }
    return ret
  }

  /**
   *
   * ex) <https://www.youtube.com/@Genshin_JP>
   */
  preAtUserPage() {
    const chInfo = this.getChannelInfoAtUserPage()

    this._title = `${generateYouTubeUserPageTitle(chInfo.channelId)}`

    /* support deprecated page format */
    let t = `${chInfo.channelName}${returnTitlePathPart(chInfo.channelUrl.pathname)}`
    t = safeWrapTitle(t, this._url.hostname)
    this._body.push(`[${t}]`)

    this._body.push(`[YouTube User Page]`)
  }

  /**
   *
   */
  postAtUserPage() {
    /* Image URL */

    const headerAvatarElem =
      (this._document.querySelector("img.yt-spec-avatar-shape__image") as HTMLImageElement) ||
      (() => {
        throw new Error("Failed to get avatar image.")
      })()
    if (!(headerAvatarElem instanceof HTMLImageElement)) {
      throw new Error(`Failed to get avatar image. the element is not HTMLImageElement.`)
    }
    const imageUrl = new URL(headerAvatarElem.src)

    this._body.push(`[${imageUrl.toString()}#.jpg]`)
  }

  /**
   *
   * @param {Document} document
   * @returns {Date}
   */
  static extractVideoUploadDateFromVideoPage(document: Document) {
    const t = document
      .getElementById("columns")
      ?.querySelector("#primary")
      ?.querySelector("#primary-inner")
      ?.querySelector("#above-the-fold")
      ?.querySelector("#bottom-row")
      ?.querySelector("#description")
      ?.querySelector("#description-inner")
      ?.querySelector("#tooltip")?.textContent
    if (t === null || t === undefined) {
      return new Date()
    }

    {
      /* '\n  4,056 回視聴 • 2022/03/21\n' */
      const regex = /.*• (?<date>[0-9]{4}\/[0-9]{2}\/[0-9]{2}).*/
      const match = regex.exec(t)

      if (match !== null && match.groups !== undefined) {
        return new Date(
          /* 2011/01/32 */
          match.groups.date
        )
      }
    }

    {
      /* 563 回視聴 • 14 時間前にライブ配信 */
      const regex = /.*• (?<hour>[0-9]{2}) 時間前.*/
      const match = regex.exec(t)
      if (match !== null && match.groups !== undefined) {
        const hour = Number(match.groups.hour)
        const d = new Date()
        d.setHours(d.getHours() - hour)
        return d
      }
    }

    return new Date()
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
function parsePage(title: string, this_page_url: URL, document: Document): ParsedData {
  console.log("parsePage")
  switch (this_page_url.hostname) {
    case "atcoder.jp": {
      return new AtcoderJpPageParser(title, this_page_url, document).do()
    }
    case "github.com":
    case "gitlab.com": {
      return new GitHubComPageParser(title, this_page_url, document).do()
    }

    case "gist.github.com": {
      return new GistGitHubComPageParser(title, this_page_url, document).do()
    }

    case "speakerdeck.com": {
      /* https://speakerdeck.com/<username>/<title> */
      return new SpeakerdeckComPageParser(title, this_page_url, document).do()
    }

    case "qiita.com":
    case "zenn.dev": {
      /**
       *
       * https://qiita.com/<username>/items/<uuid>
       * https://zenn.dev/<username>/articles/<uuid>
       */
      return new QiitaComPageParser(title, this_page_url, document).do()
    }

    case "twitter.com":
    case "mobile.twitter.com": {
      return new TwitterComPageParser(title, this_page_url, document).do()
    }

    case "www.youtube.com": {
      return new YouTubeComPageParser(title, this_page_url, document).do()
    }

    default: {
      return new OtherPageParser(title, this_page_url, document).do()
    }
  }
}

const d = new Date()

{
  const this_page_url = new URL(window.location.href)
  let title = window.prompt("Bookmark to Scrapbox", document.title)
  if (title == null) {
    alert("Need title")
    throw new Error("Need title")
  }
  /* replace special characters */
  title = title.replace(/\[/gi, "").replace(/\]/gi, "")
  /* replace backquote */
  title = title.replace(/`/gi, "")
  /* replace first slash (/) */
  title = title.replace(/^\//, "\\/")
  /* remove url from title */
  title = title.replace(/(https?:\/\/[^ ]*)/g, "")

  const data = parsePage(title, this_page_url, document)

  console.log(data)
  window.open(
    `https://scrapbox.io/${encodeURIComponent(project_name)}/${encodeURIComponent(
      data.title.trim()
    )}?body=${encodeURIComponent(data.body.join("\n"))}`
  )
}
