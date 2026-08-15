const project_name = "pollenJP-Memo"

/*********************************
 * Notion の制限に収めるための層 *
 *********************************/

/**
 * Scrapbox のページタイトル長の上限（UTF-16 code unit 基準）。
 *
 * 実データ 54,589 ページの最大値がちょうど 240 で、サロゲートペアを含む
 * タイトル（例: codepoint 215 / code unit 240）も 240 で頭打ちだったので
 * UTF-16 基準と判断した。
 */
const SCRAPBOX_TITLE_LIMIT = 240

/**
 * Notion の url プロパティの上限。
 *
 * Scrapbox への逆リンクをここに入れるので、超えると Notion 側で URL を
 * まるごと落とすしかなくなる。
 */
const NOTION_URL_LIMIT = 2000

const SCRAPBOX_PAGE_URL_PREFIX = `https://scrapbox.io/${encodeURIComponent(project_name)}/`

/**
 * Notion の markdown パーサが弾く文字を落とす。
 *
 * - C0 制御文字: 端末ログを選択コピーすると ANSI escape が紛れる
 * - U+200B (ZWSP) / U+FEFF (BOM): Web ページ、特に日本語サイトに紛れる
 *
 * どちらも Notion に投げると `Failed to parse markdown content` で 400 になる。
 * 移行時に本文 42 ページ・タイトル 14 ページで実際に踏んだ。
 *
 * ZWJ (U+200D) は絵文字の合成に要るので残す。tab と改行も残す。
 */
function stripUnsupportedChars(s: string): string {
  /* eslint-disable-next-line no-control-regex */
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B\uFEFF]/g, "")
}

/**
 * サロゲートペアを割らない slice。
 *
 * 素の `slice` は上限がペアの途中に落ちると片割れだけ残す。孤立サロゲートは
 * `encodeURIComponent` が URIError で撥ねるため、bookmarklet 自体が落ちる。
 * 絵文字入りタイトルは実データで 316 件あり、その多くが上限ちょうどに当たる。
 */
function sliceKeepingSurrogatePairs(s: string, limit: number): string {
  if (s.length <= limit) {
    return s
  }
  const code = s.charCodeAt(limit - 1)
  /* 末尾が高位サロゲートなら、ペアを割っているので 1 つ手前で切る */
  const end = code >= 0xd800 && code <= 0xdbff ? limit - 1 : limit
  return s.slice(0, end)
}

/**
 * タイトルを Scrapbox と Notion の**両方**の上限に収める。
 *
 * Scrapbox の URL は `.../<percent-encoded title>` なので、日本語 1 文字が
 * 9 文字に膨らむ。Scrapbox 上限いっぱいの 240 文字だと URL は 2,100 文字を
 * 超え、Notion の url プロパティに入らない（実データで 1 件踏んだ）。
 *
 * `suffix` は必ず残し、本体の末尾だけを削る。ホスト名などの識別子が
 * 先に消えると、ページの同一性が分からなくなるため。
 */
function fitTitle(title: string, suffix = ""): string {
  const tail = stripUnsupportedChars(suffix)
  let head = sliceKeepingSurrogatePairs(
    stripUnsupportedChars(title),
    Math.max(0, SCRAPBOX_TITLE_LIMIT - tail.length)
  )

  const budget = NOTION_URL_LIMIT - SCRAPBOX_PAGE_URL_PREFIX.length
  while (head.length > 0) {
    const over = encodeURIComponent(head + tail).length - budget
    if (over <= 0) {
      break
    }
    /* 1 文字は最大 12 文字に膨らむ。ざっくり削ってから 1 文字ずつ詰める */
    head = sliceKeepingSurrogatePairs(
      head,
      Math.max(0, head.length - Math.max(1, Math.floor(over / 12)))
    )
  }
  return head + tail
}

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
    return fitTitle(this._title)
  }

  get body() {
    return this._body.map(stripUnsupportedChars)
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
 * `<title> (<hostname>)` の形に整えつつ、Scrapbox / Notion の上限に収める。
 *
 * 本文中のページリンク（`[...]`）にも同じ関数を使うので、ここで作る文字列は
 * `ParsedData.title` と**同じ規則**で切り詰まる必要がある。ずれるとリンク先が
 * 存在しないページになる。だから両方 `fitTitle` に寄せている。
 */
function safeWrapTitle(title: string, hostname: string) {
  if (title.endsWith(`(${hostname})`)) {
    /* 既に付いている場合も、整形だけは通す。ここを素通りさせると本文 1 行目
       （`unshift` した title）と URL のタイトルがずれ、別ページになる。 */
    return fitTitle(title)
  }
  return fitTitle(title, ` (${hostname})`)
}

function getTwitterImageUrls(imageElems: HTMLImageElement[]): URL[] {
  const imgUrls: URL[] = []
  imageElems.forEach(function (imgElem) {
    if (
      imgElem.alt.toLowerCase() == "image" /* 普通 */ ||
      imgElem.alt.toLowerCase() == "画像" /* 日本語ページ */ ||
      imgElem.alt.toLowerCase() == "opens profile photo" /* profile photo */
    ) {
      const img_url = new URL(imgElem.src)
      if (!img_url.toString().endsWith(".jpg")) {
        /* scrapbox では末尾に画像 suffix ないと preview 展開されない */
        img_url.hash = "#.jpg"
      }
      imgUrls.push(img_url)
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

type GetChildElementByTagNameAndIdParamsV1 = {
  element: Element
  tagName: string
  id: string
}

function getChildElementByTagNameAndId(params: GetChildElementByTagNameAndIdParamsV1): Element {
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
    throw new Error("Not Implemented Error: This method should be overridden.")
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

    const selection = window.getSelection()
    const quote = selection !== null ? selection.toString() : ""
    this._body = this._body.concat(
      filterLines(quote.trim().split(/\n/g)).map((line) => `> ${line}`)
    )
  }
}

/**
 * remove empty lines
 */
const filterLines = (lines: string[]): string[] => {
  return lines.filter((line) => line.trim() !== "")
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
 * speakerdeck.com
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
     * プレイリストのタイトルを取得する
     */
    function getPlaylistName(root: Element): string {
      const element =
        root
          .querySelector("#page-header")
          ?.querySelector(".page-header-view-model-wiz__page-header-title") ||
        (() => {
          throw new Error("Failed to get element at `getPlaylistName`")
        })()
      if (!(element instanceof HTMLElement)) {
        throw new Error(`Failed to get playlist name. the element is not HTMLElement. (${element})`)
      }
      return element.innerText
    }

    const playlistName = getPlaylistName(this._document.documentElement)

    /**
     *
     * @param root
     * @returns YouTube account id such like `@some_name`
     */
    function getChannelAccountId(root: Element): URL {
      const element =
        root
          .querySelector("#page-header")
          ?.querySelector(".page-header-view-model-wiz__page-header-content-metadata")
          ?.querySelector(".yt-core-attributed-string__link") ||
        (() => {
          throw new Error("Failed to get element at `getChannelAccountId`")
        })()
      if (!(element instanceof HTMLAnchorElement)) {
        throw new Error(
          `Failed to get channel account id. the element is not HTMLAnchorElement. (${element})`
        )
      }
      return new URL(element.href)
    }

    const accountUrl = getChannelAccountId(this._document.documentElement)

    const playlistId = this._url.searchParams.get("list")
    if (playlistId === null) {
      throw new Error("Failed to get playlist id.")
    }

    const channelId = decodeURIComponent(
      splitUrlPath(accountUrl.pathname).at(-1) ||
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

    // get '.ytShortsVideoTitleViewModelShortsVideoTitle'
    const title = (() => {
      const titleElem = this._document.querySelector(".ytShortsVideoTitleViewModelShortsVideoTitle")
      if (titleElem === null) {
        // throw new Error("Failed to get title element")
        return null
      }
      return titleElem.textContent
    })()

    this._title = `${title || this._document.title}${returnTitlePathPart(this._url.pathname)}`
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
      /**
       * 563 回視聴 • 14 時間前にライブ配信
       * 553,517 回視聴 • 15 時間 前に公開済み
       */
      const regex = /.*• (?<hour>[0-9]{2}) 時間 *前.*/
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
    case "mobile.twitter.com":
    case "x.com": {
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
