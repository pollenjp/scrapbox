javascript: (function () {
"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PageParser_instances, _PageParser_parsePreCommon, _PageParser_parseMiddleCommon, _PageParser_parsePostCommon;
const project_name = "pollenJP-Memo";
/**
 * data class
 */
class ParsedData {
    constructor(title, body) {
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
/*************************
 * Define Util Functions *
 *************************/
function format(d, format) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return format
        .replace("ddd", days[d.getDay()])
        .replace("yyyy", `${d.getFullYear()}`)
        .replace("MM", `0${d.getMonth() + 1}`.slice(-2))
        .replace("dd", `0${d.getDate()}`.slice(-2))
        .replace("hh", `0${d.getHours()}`.slice(-2))
        .replace("mm", `0${d.getMinutes()}`.slice(-2))
        .replace("ss", `0${d.getSeconds()}`.slice(-2));
}
/**
 * ex) /aaa/bbb/ccc => ["aaa", "bbb", "ccc"]
 */
function splitUrlPath(urlPath) {
    let pathList = urlPath.split("/").slice(1);
    if (pathList.slice(-1)[0].length == 0) {
        pathList = pathList.slice(0, -1);
    }
    return pathList;
}
/**
 * scrapbox に生成するページのタイトルのうち URL path の部分を生成する.
 */
function returnTitlePathPart(path) {
    if (path.length == 1) {
        /* ルートパスの時は空文字を返す */
        return "";
    }
    return ` (${decodeURI(path)})`;
}
/**
 *
 */
function safeWrapTitle(title, hostname) {
    if (title.endsWith(`(${hostname})`)) {
        return title;
    }
    return `${title} (${hostname})`;
}
function getTwitterImageUrls(imageElems) {
    const imgUrls = [];
    imageElems.forEach(function (imgElem) {
        if (imgElem.alt == "Image" || imgElem.alt == "画像") {
            const img_url = new URL(imgElem.src);
            imgUrls.push(new URL(`${img_url.origin}${img_url.pathname}.jpg`));
        }
    });
    return imgUrls;
}
/**
 * YouTube の `@username` から Scrapbox 上で紐づけるための一意なタイトルを生成する
 */
function generateYouTubeUserPageTitle(userId) {
    return `${userId} (www.youtube.com)`;
}
/**
 * get the first element having the specified tag name
 */
function getChildElementByTagName(element, tagName) {
    tagName = tagName.toUpperCase();
    for (const elem of element.children) {
        if (elem.tagName == tagName) {
            return elem;
        }
    }
    console.log(element);
    throw new Error(`Element not found: ${tagName} ${element}`);
}
function getChildElementByTagNameAndId(element, tagName, id) {
    tagName = tagName.toUpperCase();
    for (const elem of element.children) {
        if (elem.tagName !== tagName) {
            continue;
        }
        if (elem.id === id) {
            return elem;
        }
    }
    console.log(element);
    throw new Error(`Element not found: ${tagName} ${id} ${element}`);
}
function getChildElementByTagNameAndClass(element, tagName, classList) {
    tagName = tagName.toUpperCase();
    for (const elem of element.children) {
        if (elem.tagName !== tagName) {
            continue;
        }
        let is_match = true;
        for (const className of classList) {
            if (!elem.classList.contains(className)) {
                is_match = false;
                break;
            }
        }
        if (is_match) {
            return elem;
        }
    }
    console.log(element);
    throw new Error(`Element not found: ${tagName} ${classList}`);
}
function getChildElementByTagNameAndAttribute(element, tagName, attributeName) {
    tagName = tagName.toUpperCase();
    for (const elem of element.children) {
        if (elem.tagName !== tagName) {
            continue;
        }
        if (elem.getAttribute(attributeName) !== null) {
            return elem;
        }
    }
    console.log(element);
    throw new Error(`Element not found: ${tagName} / ${attributeName} / ${element}`);
}
/* End Define Functions */
/***************
 * Page Parser *
 ***************/
/**
 * Base Class
 */
class PageParser {
    constructor(title, url, document) {
        _PageParser_instances.add(this);
        this._body = [];
        this._title = title;
        this._url = url;
        this._document = document;
        this._urlPathList = splitUrlPath(this._url.pathname);
    }
    do() {
        __classPrivateFieldGet(this, _PageParser_instances, "m", _PageParser_parsePreCommon).call(this);
        console.log("parsePreCustom");
        this.parsePreCustom();
        __classPrivateFieldGet(this, _PageParser_instances, "m", _PageParser_parseMiddleCommon).call(this);
        console.log("parsePostCustom");
        this.parsePostCustom();
        __classPrivateFieldGet(this, _PageParser_instances, "m", _PageParser_parsePostCommon).call(this);
        return new ParsedData(this._title, this._body);
    }
    /**
     * Should be override.
     */
    parsePreCustom() {
        throw new Error("Not Implemented Error: This method should be overridden.");
    }
    /**
     * Should be override.
     */
    parsePostCustom() {
        throw new Error("Not Implemented Error: This method should be overrided.");
    }
}
_PageParser_instances = new WeakSet(), _PageParser_parsePreCommon = function _PageParser_parsePreCommon() {
    console.log("parsePreCommon");
}, _PageParser_parseMiddleCommon = function _PageParser_parseMiddleCommon() {
    console.log("parseMiddleCommon");
    this._body.push(`[${this._url.hostname}]`, `Scrap at [date${format(d, "yyyy-MM-dd")}]`, "", `\`${this._document.title}\``, `${this._url.toString()}`, "");
}, _PageParser_parsePostCommon = function _PageParser_parsePostCommon() {
    console.log("parsePostCommon");
    /* title */
    this._title = safeWrapTitle(this._title, this._url.hostname);
    this._body.unshift(this._title);
    /* body */
    const s = window.getSelection();
    const quote = s !== null ? s.toString() : "";
    let quoteLines = [];
    if (quote.trim()) {
        /* 空白行を null に置き換える */
        quoteLines = quote.split(/\n/g).map(function (line) {
            if (line !== "") {
                return `  > ${line}`;
            }
            return null;
        });
    }
    /* 空白行 (null) の削除 */
    for (let i = 0; i < quoteLines.length; ++i) {
        quoteLines.forEach((line, i) => {
            if (line !== null) {
                this._body.push(line);
            }
        });
    }
};
class OtherPageParser extends PageParser {
    parsePreCustom() {
        this._title += returnTitlePathPart(this._url.pathname);
    }
    parsePostCustom() {
        console.log("parsePostCustom");
    }
}
/**
 * atcoder.jp
 */
class AtcoderJpPageParser extends PageParser {
    parsePreCustom() {
        this._title += ` (${this._urlPathList.slice(0, 2).join("/")})`;
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
                const itemName = this._urlPathList[2];
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
    parsePostCustom() {
        console.log("parsePostCustom");
    }
    /**
     *
     */
    generatePageAtUserPage() {
        const username = this._urlPathList[0];
        this._title = username;
    }
    /**
     *
     */
    generatePageAtReposRootPage() {
        const username = this._urlPathList[0];
        const reposName = this._urlPathList[1];
        this._title = `${username}/${reposName}`;
        this._body.push(`[${this._url.hostname}/${username}/${reposName}]`);
        this._body.push(`[${safeWrapTitle(username, this._url.hostname)}]`);
    }
    /**
     *
     */
    generatePageAtBlobOrTreePage() {
        const username = this._urlPathList[0];
        const reposName = this._urlPathList[1];
        this._title = this._urlPathList.join("/");
        const userPageTitle = safeWrapTitle(`${username}/${reposName}`, this._url.hostname);
        this._body.push(`[${userPageTitle}]`);
    }
    /**
     *
     */
    generatePageAtOtherPage() {
        this._title += returnTitlePathPart(this._url.pathname);
        const path = this._urlPathList.slice(0, 2).join("/");
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
                const username = this._urlPathList[0];
                this._title = username;
                break;
            }
            case 2: {
                const username = this._urlPathList[0];
                this._title = this._urlPathList.join("/");
                this._body.push(`[${safeWrapTitle(username, this._url.hostname)}]`);
                break;
            }
            default: {
                alert(`Failed: ${this._urlPathList}`);
            }
        }
    }
    parsePostCustom() {
        console.log("parsePostCustom");
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
        const username = this._urlPathList[0];
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
    parsePostCustom() {
        console.log("parsePostCustom");
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
        const username = this._urlPathList[0];
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
    parsePostCustom() {
        console.log("parsePostCustom");
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
        getTwitterImageUrls([].slice.call(this._document.querySelectorAll("img"))).forEach((url) => {
            this._body.push(`[${url.toString()}]`);
        });
    }
    parseUserPage() {
        const username = TwitterComPageParser.parseUserNameFromUrlPath(this._url.pathname);
        this._title = TwitterComPageParser.getUserPageTitle(username);
        this._body.push(`[Twitter User Page]`);
    }
    parseTweetPage() {
        const username = TwitterComPageParser.parseUserNameFromUrlPath(this._url.pathname);
        this._title = `${this._title}${returnTitlePathPart(this._url.pathname)}`;
        this._body.push(`[${safeWrapTitle(TwitterComPageParser.getUserPageTitle(username), this._url.hostname)}]`);
    }
    static getUserPageTitle(username) {
        return `${username} (/${username})`;
    }
    /**
     *
     */
    static parseUserNameFromUrlPath(path) {
        const urlPathArray = splitUrlPath(path);
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
            case "shorts": {
                /* ex) <https://www.youtube.com/shorts/0V7LPbjRDqk> */
                this.preAtShortsPage();
                return;
            }
            default: {
                if (this._urlPathList[0].slice(0, 1) == "@") {
                    /* user page */
                    this.preAtUserPage();
                }
                else {
                    throw new Error("Not Supported URI");
                }
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
                return;
            }
            case "shorts": {
                this.postAtShortsPage();
                return;
            }
            default: {
                if (this._urlPathList[0].slice(0, 1) == "@") {
                    /* user page */
                    this.postAtUserPage();
                    return;
                }
            }
        }
        console.log("debug: no processing.");
    }
    extractVideoIdFromVideoUrl(url) {
        const videoId = url.searchParams.get("v");
        if (videoId === null) {
            throw new Error(`Failed to get video id from the url (${url})`);
        }
        return videoId;
    }
    /**
     *
     */
    preAtVideoPage() {
        var _a, _b, _c, _d;
        let channelUrl;
        {
            const elem = (_d = (_c = (_b = (_a = this._document) === null || _a === void 0 ? void 0 : _a.getElementById("above-the-fold")) === null || _b === void 0 ? void 0 : _b.querySelector("#top-row")) === null || _c === void 0 ? void 0 : _c.querySelector("#owner")) === null || _d === void 0 ? void 0 : _d.getElementsByTagName("a");
            if (elem === undefined) {
                throw new Error("Failed to get channel url");
            }
            channelUrl = new URL(elem[0].href);
        }
        const channelId = splitUrlPath(channelUrl.pathname).at(-1);
        if (channelId === undefined) {
            throw new Error("Failed to get channel id");
        }
        const videoId = this.extractVideoIdFromVideoUrl(this._url);
        const ds = format(YouTubeComPageParser.extractVideoUploadDateFromVideoPage(document), "yyyy-MM-dd");
        this._title = `${ds} ${this._title} (${videoId}) (${channelId})`;
        this._body.push(`[${generateYouTubeUserPageTitle(channelId)}]`);
    }
    /**
     *
     */
    postAtVideoPage() {
        const videoId = this.extractVideoIdFromVideoUrl(this._url);
        const thumbnailImageUrl = new URL(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
        this._body.push(`[${this._url.toString()}]`, `[${thumbnailImageUrl.toString()}]`);
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
            element = getChildElementByTagName(element, "ytd-playlist-header-renderer");
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
            element = getChildElementByTagName(element, "yt-dynamic-sizing-formatted-string");
            element = getChildElementByTagNameAndId(element, "div", "container");
            element = getChildElementByTagNameAndId(element, "yt-formatted-string", "text");
            console.log(element);
            if (element instanceof HTMLElement) {
                return element.innerText;
            }
            throw new Error(`Failed to get playlist name. the element is not HTMLElement. (${element})`);
        }
        const playlistName = getPlaylistName(this._document.documentElement);
        function getChannelNameAndURL(root) {
            let element = root;
            element = getChildElementByTagName(element, "body");
            element = getChildElementByTagName(element, "ytd-app");
            element = getChildElementByTagNameAndId(element, "div", "content");
            element = getChildElementByTagName(element, "ytd-page-manager");
            element = getChildElementByTagName(element, "ytd-browse");
            element = getChildElementByTagName(element, "ytd-playlist-header-renderer");
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
            element = getChildElementByTagNameAndId(element, "yt-formatted-string", "owner-text");
            element = getChildElementByTagName(element, "a");
            if (!(element instanceof HTMLAnchorElement)) {
                throw new Error(`Failed to get channel name and url. the element is not HTMLAnchorElement. (${element})`);
            }
            return { name: element.text, url: new URL(element.href) };
        }
        const channelInfo = getChannelNameAndURL(this._document.documentElement);
        console.log(channelInfo.name, channelInfo.url);
        const playlistId = this._url.searchParams.get("list");
        if (playlistId === null) {
            throw new Error("Failed to get playlist id.");
        }
        const channelId = splitUrlPath(channelInfo.url.pathname).at(-1);
        if (channelId === undefined) {
            throw new Error("Failed to get channel id.");
        }
        this._title = `${playlistName} (playlist:${playlistId}) (${channelId})`;
        this._body.push(`[${generateYouTubeUserPageTitle(channelId)}]`);
    }
    /**
     *
     */
    postAtPlaylistPage() {
        this._body.push(`[${this._url.toString()}]`);
    }
    /**
     *
     */
    preAtShortsPage() {
        function getChannelUrlAtShortsPage(document) {
            const elem = document.getElementById("page-manager");
            if (elem === null) {
                throw new Error("'page-manager' id is not found");
            }
            let element = getChildElementByTagName(elem, "ytd-shorts");
            element = getChildElementByTagNameAndId(element, "div", "shorts-container");
            element = getChildElementByTagNameAndId(element, "div", "shorts-inner-container");
            /* get element having `is-active` option */
            element = getChildElementByTagNameAndAttribute(element, "ytd-reel-video-renderer", "is-active");
            element = getChildElementByTagNameAndClass(element, "div", [
                "overlay",
                "style-scope",
                "ytd-reel-video-renderer",
            ]);
            element = getChildElementByTagName(element, "ytd-reel-player-overlay-renderer");
            element = getChildElementByTagNameAndId(element, "div", "overlay");
            element = getChildElementByTagName(element, "ytd-reel-player-header-renderer");
            element = getChildElementByTagNameAndId(element, "div", "channel-container");
            element = getChildElementByTagNameAndId(element, "div", "channel-info");
            element = getChildElementByTagName(element, "ytd-channel-name");
            element = getChildElementByTagNameAndId(element, "div", "container");
            element = getChildElementByTagNameAndId(element, "div", "text-container");
            element = getChildElementByTagNameAndId(element, "yt-formatted-string", "text");
            element = getChildElementByTagName(element, "a");
            if (!(element instanceof HTMLAnchorElement)) {
                throw new Error(`Failed to get channel url. the element is not HTMLAnchorElement. (${element})`);
            }
            return new URL(element.href);
        }
        const channelUrl = getChannelUrlAtShortsPage(this._document);
        const channelId = splitUrlPath(channelUrl.pathname)[0];
        this._title = `${this._document.title}${returnTitlePathPart(this._url.pathname)}`;
        this._body.push(`[${generateYouTubeUserPageTitle(channelId)}]`);
    }
    /**
     *
     */
    postAtShortsPage() {
        const videoId = this._urlPathList.at(-1);
        if (videoId === undefined) {
            throw new Error("Failed to get video id.");
        }
        const thumbnailImageUrl = new URL(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
        this._body.push(`[${thumbnailImageUrl.toString()}]`);
    }
    /**
     *
     * @returns {{channelName: string, channelId: string, channelUrl: URL}}
     */
    getChannelInfoAtUserPage() {
        var _a, _b, _c, _d, _e, _f, _g;
        const elem = (_g = (_f = (_e = (_d = (_c = (_b = (_a = this._document
            .getElementById("channel-container")) === null || _a === void 0 ? void 0 : _a.querySelector("#channel-header")) === null || _b === void 0 ? void 0 : _b.querySelector("#channel-header-container")) === null || _c === void 0 ? void 0 : _c.querySelector("#inner-header-container")) === null || _d === void 0 ? void 0 : _d.querySelector("#meta")) === null || _e === void 0 ? void 0 : _e.querySelector("#container")) === null || _f === void 0 ? void 0 : _f.querySelector("#text-container")) === null || _g === void 0 ? void 0 : _g.querySelector("#text");
        if (elem === null || elem === undefined) {
            throw new Error("Failed to get channel name.");
        }
        const channelName = elem.innerHTML;
        const channelId = this._urlPathList[0];
        return {
            channelName: channelName,
            channelId: channelId,
            channelUrl: new URL(`${this._url.origin}/${channelId}`),
        };
    }
    /**
     *
     * ex) <https://www.youtube.com/@Genshin_JP>
     */
    preAtUserPage() {
        const chInfo = this.getChannelInfoAtUserPage();
        this._title = `${generateYouTubeUserPageTitle(chInfo.channelId)}`;
        /* support deprecated page format */
        let t = `${chInfo.channelName}${returnTitlePathPart(chInfo.channelUrl.pathname)}`;
        t = safeWrapTitle(t, this._url.hostname);
        this._body.push(`[${t}]`);
        this._body.push(`[YouTube User Page]`);
    }
    /**
     *
     */
    postAtUserPage() {
        /* Image URL */
        var _a, _b, _c, _d, _e;
        const elem = (_e = (_d = (_c = (_b = (_a = this._document) === null || _a === void 0 ? void 0 : _a.getElementById("channel-container")) === null || _b === void 0 ? void 0 : _b.querySelector("#channel-header")) === null || _c === void 0 ? void 0 : _c.querySelector("#channel-header-container")) === null || _d === void 0 ? void 0 : _d.querySelector("#avatar")) === null || _e === void 0 ? void 0 : _e.querySelector("#img");
        if (elem === null || elem === undefined) {
            throw new Error("Failed to get avatar image.");
        }
        if (!(elem instanceof HTMLImageElement)) {
            throw new Error(`Failed to get avatar image. the element is not HTMLImageElement.`);
        }
        const imageUrl = new URL(elem.src);
        this._body.push(`[${imageUrl.toString()}#.jpg]`);
    }
    /**
     *
     * @param {Document} document
     * @returns {Date}
     */
    static extractVideoUploadDateFromVideoPage(document) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const t = (_h = (_g = (_f = (_e = (_d = (_c = (_b = (_a = document
            .getElementById("columns")) === null || _a === void 0 ? void 0 : _a.querySelector("#primary")) === null || _b === void 0 ? void 0 : _b.querySelector("#primary-inner")) === null || _c === void 0 ? void 0 : _c.querySelector("#above-the-fold")) === null || _d === void 0 ? void 0 : _d.querySelector("#bottom-row")) === null || _e === void 0 ? void 0 : _e.querySelector("#description")) === null || _f === void 0 ? void 0 : _f.querySelector("#description-inner")) === null || _g === void 0 ? void 0 : _g.querySelector("#tooltip")) === null || _h === void 0 ? void 0 : _h.textContent;
        if (t === null || t === undefined) {
            return new Date();
        }
        {
            /* '\n  4,056 回視聴 • 2022/03/21\n' */
            const regex = /.*• (?<date>[0-9]{4}\/[0-9]{2}\/[0-9]{2}).*/;
            const match = regex.exec(t);
            if (match !== null && match.groups !== undefined) {
                return new Date(
                /* 2011/01/32 */
                match.groups.date);
            }
        }
        {
            /* 563 回視聴 • 14 時間前にライブ配信 */
            const regex = /.*• (?<hour>[0-9]{2}) 時間前.*/;
            const match = regex.exec(t);
            if (match !== null && match.groups !== undefined) {
                const hour = Number(match.groups.hour);
                const d = new Date();
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
            return new SpeakerdeckComPageParser(title, this_page_url, document).do();
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
}
const d = new Date();
{
    const this_page_url = new URL(window.location.href);
    let title = window.prompt("Bookmark to Scrapbox", document.title);
    if (title == null) {
        alert("Need title");
        throw new Error("Need title");
    }
    /* replace special characters */
    title = title.replace(/\[/gi, "").replace(/\]/gi, "");
    /* replace backquote */
    title = title.replace(/`/gi, "");
    /* replace first slash (/) */
    title = title.replace(/^\//, "\\/");
    /* remove url from title */
    title = title.replace(/(https?:\/\/[^ ]*)/g, "");
    const data = parsePage(title, this_page_url, document);
    console.log(data);
    window.open(`https://scrapbox.io/${encodeURIComponent(project_name)}/${encodeURIComponent(data.title.trim())}?body=${encodeURIComponent(data.body.join("\n"))}`);
}
})();
