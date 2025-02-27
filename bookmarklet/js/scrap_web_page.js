javascript: (function () {
"use strict";const project_name="pollenJP-Memo";class ParsedData{_title;_body;constructor(e,t){this._title=e,this._body=t}get title(){return this._title.slice(0,240)}get body(){return this._body}}function format(e,t){return t.replace("ddd",["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][e.getDay()]).replace("yyyy",`${e.getFullYear()}`).replace("MM",`0${e.getMonth()+1}`.slice(-2)).replace("dd",`0${e.getDate()}`.slice(-2)).replace("hh",`0${e.getHours()}`.slice(-2)).replace("mm",`0${e.getMinutes()}`.slice(-2)).replace("ss",`0${e.getSeconds()}`.slice(-2))}function splitUrlPath(e){let t=e.split("/").slice(1);return 0==t.slice(-1)[0].length&&(t=t.slice(0,-1)),t}function returnTitlePathPart(e){return 1==e.length?"":` (${decodeURI(e)})`}function safeWrapTitle(e,t){if(e.endsWith(`(${t})`))return e;const r=`${e} (${t})`;if(r.length<=240)return r;const a=r.length-240;return`${e.slice(0,e.length-a)} (${t})`}function getTwitterImageUrls(e){const t=[];return e.forEach((function(e){if("image"==e.alt.toLowerCase()||"画像"==e.alt.toLowerCase()||"opens profile photo"==e.alt.toLowerCase()){const r=new URL(e.src);r.toString().endsWith(".jpg")||(r.hash="#.jpg"),t.push(r)}})),t}function generateYouTubeUserPageTitle(e){return`${e} (www.youtube.com)`}function getChildElementByTagName(e,t){t=t.toUpperCase();for(const r of e.children)if(r.tagName==t)return r;throw console.log("==== element ==="),console.log(e),console.log("==== element.children ==="),console.log(e.children),new Error(`Element not found: ${t} ${e}`)}function getChildElementByTagNameAndId(e){const t=e.tagName.toUpperCase();for(const r of e.element.children)if(r.tagName===t&&r.id===e.id)return r;throw console.log(e.element),new Error(`Element not found: ${t} ${e.id} ${e.element}`)}function getChildElementByTagNameAndClass(e,t,r){t=t.toUpperCase();for(const a of e.children){if(a.tagName!==t)continue;let e=!0;for(const t of r)if(!a.classList.contains(t)){e=!1;break}if(e)return a}throw console.log(e),new Error(`Element not found: ${t} ${r}`)}function getChildElementByTagNameAndAttribute(e,t,r){t=t.toUpperCase();for(const a of e.children)if(a.tagName===t&&null!==a.getAttribute(r))return a;throw console.log(e),new Error(`Element not found: ${t} / ${r} / ${e}`)}Element.prototype.getChildElementByTagNameAndId=function(e){const t=e.tagName.toUpperCase();for(const r of this.children)if(r.tagName===t&&r.id===e.id)return r;throw console.log(this),new Error(`Element not found: ${t} ${e.id} ${this}`)};const getDeepTextContent=e=>{let t="";for(const r of e.childNodes)r.nodeType===Node.TEXT_NODE?t+=r.textContent:r.nodeType===Node.ELEMENT_NODE&&(t+=getDeepTextContent(r));return t.trim()};class PageParser{_title;_body=[];_url;_document;_urlPathList;constructor(e,t,r){this._title=e,this._url=t,this._document=r,this._urlPathList=splitUrlPath(this._url.pathname).map((e=>decodeURIComponent(e)))}do(){return this.#e(),console.log("parsePreCustom"),this.parsePreCustom(),this.#t(),console.log("parsePostCustom"),this.parsePostCustom(),this.#r(),new ParsedData(this._title,this._body)}#e(){console.log("parsePreCommon")}parsePreCustom(){throw new Error("Not Implemented Error: This method should be overridden.")}#t(){console.log("parseMiddleCommon"),this._body.push(`[${this._url.hostname}]`,`Scrap at [date${format(d,"yyyy-MM-dd")}]`,"",`\`${this._document.title}\``,`${this._url.toString()}`,"")}parsePostCustom(){throw new Error("Not Implemented Error: This method should be overridden.")}#r(){console.log("parsePostCommon"),this._title=safeWrapTitle(this._title,this._url.hostname),this._body.unshift(this._title);const e=window.getSelection(),t=null!==e?e.toString():"";let r=[];t.trim()&&(r=t.split(/\n/g).map((function(e){return""!==e?`  > ${e}`:null})));for(let e=0;e<r.length;++e)r.forEach((e=>{null!==e&&this._body.push(e)}))}}class OtherPageParser extends PageParser{parsePreCustom(){this._title+=returnTitlePathPart(this._url.pathname)}parsePostCustom(){console.log("parsePostCustom")}}class AtcoderJpPageParser extends PageParser{parsePreCustom(){this._title+=` (${this._urlPathList.slice(0,2).join("/")})`}}class GitHubComPageParser extends PageParser{parsePreCustom(){switch(this._urlPathList.length){case 0:return;case 1:return void this.generatePageAtUserPage();case 2:return void this.generatePageAtReposRootPage();default:switch(this._urlPathList[2]){case"tree":case"blob":return void this.generatePageAtBlobOrTreePage();default:return void this.generatePageAtOtherPage()}}}parsePostCustom(){console.log("parsePostCustom")}generatePageAtUserPage(){const e=this._urlPathList[0];this._title=e}generatePageAtReposRootPage(){const e=this._urlPathList[0],t=this._urlPathList[1];this._title=`${e}/${t}`,this._body.push(`[${this._url.hostname}/${e}/${t}]`),this._body.push(`[${safeWrapTitle(e,this._url.hostname)}]`)}generatePageAtBlobOrTreePage(){const e=this._urlPathList[0],t=this._urlPathList[1];this._title=this._urlPathList.join("/");const r=safeWrapTitle(`${e}/${t}`,this._url.hostname);this._body.push(`[${r}]`)}generatePageAtOtherPage(){this._title+=returnTitlePathPart(this._url.pathname);const e=this._urlPathList.slice(0,2).join("/");this._body.push(`[${safeWrapTitle(e,this._url.hostname)}]`)}}class GistGitHubComPageParser extends PageParser{parsePreCustom(){switch(this._urlPathList.length){case 0:break;case 1:{const e=this._urlPathList[0];this._title=e;break}case 2:{const e=this._urlPathList[0];this._title=this._urlPathList.join("/"),this._body.push(`[${safeWrapTitle(e,this._url.hostname)}]`);break}default:alert(`Failed: ${this._urlPathList}`)}}parsePostCustom(){console.log("parsePostCustom")}}class QiitaComPageParser extends PageParser{parsePreCustom(){const e=this._urlPathList[0];switch(this._urlPathList.length){case 1:this._title=e;break;case 3:this._title+=returnTitlePathPart(this._url.pathname),this._body.push(`[${safeWrapTitle(e,this._url.hostname)}]`);break;default:this._title+=returnTitlePathPart(this._url.pathname)}}parsePostCustom(){console.log("parsePostCustom")}}class SpeakerdeckComPageParser extends PageParser{parsePreCustom(){const e=this._urlPathList[0];switch(this._urlPathList.length){case 1:this._title=e;break;case 2:this._title+=returnTitlePathPart(this._url.pathname),this._body.push(`[${safeWrapTitle(e,this._url.hostname)}]`)}}parsePostCustom(){console.log("parsePostCustom")}}class TwitterComPageParser extends PageParser{parsePreCustom(){switch(this._urlPathList.length){case 0:return;case 1:return void this.parseUserPage();default:return void this.parseTweetPage()}}parsePostCustom(){getTwitterImageUrls([].slice.call(this._document.querySelectorAll("img"))).forEach((e=>{this._body.push(`[${e.toString()}]`)}))}parseUserPage(){const e=TwitterComPageParser.parseUserNameFromUrlPath(this._url.pathname);this._title=TwitterComPageParser.getUserPageTitle(e),this._body.push("[Twitter User Page]")}parseTweetPage(){const e=TwitterComPageParser.parseUserNameFromUrlPath(this._url.pathname);this._title=`${this._title}${returnTitlePathPart(this._url.pathname)}`,this._body.push(`[${safeWrapTitle(TwitterComPageParser.getUserPageTitle(e),this._url.hostname)}]`)}static getUserPageTitle(e){return`${e} (/${e})`}static parseUserNameFromUrlPath(e){const t=splitUrlPath(e);return t.length<1&&alert(`Failed to get user from ${e}`),decodeURIComponent(t[0])}}class YouTubeComPageParser extends PageParser{parsePreCustom(){switch(this._urlPathList[0]){case"watch":case"live":return void this.preAtWatchOrLivePage({pageType:this._urlPathList[0]});case"playlist":return void this.preAtPlaylistPage();case"shorts":return void this.preAtShortsPage();default:if("@"!=this._urlPathList[0].slice(0,1))throw new Error("Not Supported URI");this.preAtUserPage()}console.log("debug: no processing.")}parsePostCustom(){switch(this._urlPathList[0]){case"watch":return void this.postAtVideoPage();case"playlist":return void this.postAtPlaylistPage();case"shorts":return void this.postAtShortsPage();default:if("@"==this._urlPathList[0].slice(0,1))return void this.postAtUserPage()}console.log("debug: no processing.")}static extractVideoIdFromWatchUrl(e){const t=e.searchParams.get("v");if(null===t)throw new Error(`Failed to get video id from the url (${e})`);return t}static extractVideoIdFromLiveUrl(e){const t=splitUrlPath(e.pathname).at(-1);if(void 0===t)throw new Error(`Failed to get video id from the url (${e})`);return t}preAtWatchOrLivePage({pageType:e}){const t="watch"===e?YouTubeComPageParser.extractVideoIdFromWatchUrl(this._url):YouTubeComPageParser.extractVideoIdFromLiveUrl(this._url);let r;{const e=this._document?.getElementById("above-the-fold")?.querySelector("#top-row")?.querySelector("#owner")?.getElementsByTagName("a");if(void 0===e)throw new Error("Failed to get channel url");r=new URL(e[0].href)}const a=decodeURIComponent(splitUrlPath(r.pathname).at(-1)||(()=>{throw new Error("Failed to get channel id")})()),s=format(YouTubeComPageParser.extractVideoUploadDateFromVideoPage(document),"yyyy-MM-dd");this._title=`${s} ${this._title} (${t}) (${a})`,this._body.push(`[${generateYouTubeUserPageTitle(a)}]`)}postAtVideoPage(){const e=YouTubeComPageParser.extractVideoIdFromWatchUrl(this._url),t=new URL(`https://img.youtube.com/vi/${e}/maxresdefault.jpg`);this._body.push(`[${this._url.toString()}]`,`[${t.toString()}]`)}preAtPlaylistPage(){const e=function getPlaylistName(e){let t=e;if(t=getChildElementByTagName(t,"body"),t=getChildElementByTagName(t,"ytd-app"),t=getChildElementByTagNameAndId({element:t,tagName:"div",id:"content"}),t=getChildElementByTagName(t,"ytd-page-manager"),t=getChildElementByTagName(t,"ytd-browse"),t=getChildElementByTagName(t,"ytd-playlist-header-renderer"),t=getChildElementByTagNameAndClass(t,"div",["immersive-header-container","style-scope","ytd-playlist-header-renderer"]),t=getChildElementByTagNameAndClass(t,"div",["immersive-header-content","style-scope","ytd-playlist-header-renderer"]),t=getChildElementByTagNameAndClass(t,"div",["thumbnail-and-metadata-wrapper","style-scope","ytd-playlist-header-renderer"]),t=getChildElementByTagNameAndClass(t,"div",["metadata-wrapper","style-scope","ytd-playlist-header-renderer"]),t=getChildElementByTagName(t,"yt-dynamic-sizing-formatted-string"),t=getChildElementByTagNameAndId({element:t,tagName:"div",id:"container"}),t=getChildElementByTagNameAndId({element:t,tagName:"yt-formatted-string",id:"text"}),console.log(t),t instanceof HTMLElement)return t.innerText;throw new Error(`Failed to get playlist name. the element is not HTMLElement. (${t})`)}(this._document.documentElement);const t=function getChannelNameAndURL(e){let t=e;if(t=getChildElementByTagName(t,"body"),t=getChildElementByTagName(t,"ytd-app"),t=getChildElementByTagNameAndId({element:t,tagName:"div",id:"content"}),t=getChildElementByTagName(t,"ytd-page-manager"),t=getChildElementByTagName(t,"ytd-browse"),t=getChildElementByTagName(t,"ytd-playlist-header-renderer"),t=getChildElementByTagNameAndClass(t,"div",["immersive-header-container","style-scope","ytd-playlist-header-renderer"]),t=getChildElementByTagNameAndClass(t,"div",["immersive-header-content","style-scope","ytd-playlist-header-renderer"]),t=getChildElementByTagNameAndClass(t,"div",["thumbnail-and-metadata-wrapper","style-scope","ytd-playlist-header-renderer"]),t=getChildElementByTagNameAndClass(t,"div",["metadata-wrapper","style-scope","ytd-playlist-header-renderer"]),t=getChildElementByTagNameAndClass(t,"div",["metadata-action-bar","style-scope","ytd-playlist-header-renderer"]),t=getChildElementByTagNameAndClass(t,"div",["metadata-text-wrapper","style-scope","ytd-playlist-header-renderer"]),t=getChildElementByTagNameAndClass(t,"div",["metadata-owner","style-scope","ytd-playlist-header-renderer"]),t=getChildElementByTagNameAndId({element:t,tagName:"yt-formatted-string",id:"owner-text"}),t=getChildElementByTagName(t,"a"),!(t instanceof HTMLAnchorElement))throw new Error(`Failed to get channel name and url. the element is not HTMLAnchorElement. (${t})`);return{name:t.text,url:new URL(t.href)}}(this._document.documentElement);console.log(t.name,t.url);const r=this._url.searchParams.get("list");if(null===r)throw new Error("Failed to get playlist id.");const a=decodeURIComponent(splitUrlPath(t.url.pathname).at(-1)||(()=>{throw new Error("Failed to get channel id")})());this._title=`${e} (playlist:${r}) (${a})`,this._body.push(`[${generateYouTubeUserPageTitle(a)}]`)}postAtPlaylistPage(){this._body.push(`[${this._url.toString()}]`)}preAtShortsPage(){const e=new URL(this._document.getElementsByClassName("yt-core-attributed-string__link")[0].href),t=decodeURIComponent(splitUrlPath(e.pathname).at(0)||(()=>{throw new Error("Failed to get channel id")})());this._title=`${this._document.title}${returnTitlePathPart(this._url.pathname)}`,this._body.push(`[${generateYouTubeUserPageTitle(t)}]`)}postAtShortsPage(){const e=this._urlPathList.at(-1);if(void 0===e)throw new Error("Failed to get video id.");const t=new URL(`https://img.youtube.com/vi/${e}/maxresdefault.jpg`);this._body.push(`[${t.toString()}]`)}getChannelInfoAtUserPage(){const e=getDeepTextContent(this._document.getElementsByClassName("page-header-view-model-wiz__page-header-title")[0]),t=this._document.querySelector(".page-header-view-model-wiz__page-header-content-metadata").querySelector("div.yt-content-metadata-view-model-wiz__metadata-row span.yt-core-attributed-string").textContent||(()=>{throw new Error("Failed to get channel id.")})();return{channelName:e,channelId:t,channelUrl:new URL(`${this._url.origin}/${t}`)}}preAtUserPage(){const e=this.getChannelInfoAtUserPage();this._title=`${generateYouTubeUserPageTitle(e.channelId)}`;let t=`${e.channelName}${returnTitlePathPart(e.channelUrl.pathname)}`;t=safeWrapTitle(t,this._url.hostname),this._body.push(`[${t}]`),this._body.push("[YouTube User Page]")}postAtUserPage(){const e=this._document.querySelector("img.yt-spec-avatar-shape__image")||(()=>{throw new Error("Failed to get avatar image.")})();if(!(e instanceof HTMLImageElement))throw new Error("Failed to get avatar image. the element is not HTMLImageElement.");const t=new URL(e.src);this._body.push(`[${t.toString()}#.jpg]`)}static extractVideoUploadDateFromVideoPage(e){const t=e.getElementById("columns")?.querySelector("#primary")?.querySelector("#primary-inner")?.querySelector("#above-the-fold")?.querySelector("#bottom-row")?.querySelector("#description")?.querySelector("#description-inner")?.querySelector("#tooltip")?.textContent;if(null==t)return new Date;{const e=/.*• (?<date>[0-9]{4}\/[0-9]{2}\/[0-9]{2}).*/.exec(t);if(null!==e&&void 0!==e.groups)return new Date(e.groups.date)}{const e=/.*• (?<hour>[0-9]{2}) 時間前.*/.exec(t);if(null!==e&&void 0!==e.groups){const t=Number(e.groups.hour),r=new Date;return r.setHours(r.getHours()-t),r}}return new Date}}function parsePage(e,t,r){switch(console.log("parsePage"),t.hostname){case"atcoder.jp":return new AtcoderJpPageParser(e,t,r).do();case"github.com":case"gitlab.com":return new GitHubComPageParser(e,t,r).do();case"gist.github.com":return new GistGitHubComPageParser(e,t,r).do();case"speakerdeck.com":return new SpeakerdeckComPageParser(e,t,r).do();case"qiita.com":case"zenn.dev":return new QiitaComPageParser(e,t,r).do();case"twitter.com":case"mobile.twitter.com":case"x.com":return new TwitterComPageParser(e,t,r).do();case"www.youtube.com":return new YouTubeComPageParser(e,t,r).do();default:return new OtherPageParser(e,t,r).do()}}const d=new Date;{const e=new URL(window.location.href);let t=window.prompt("Bookmark to Scrapbox",document.title);if(null==t)throw alert("Need title"),new Error("Need title");t=t.replace(/\[/gi,"").replace(/\]/gi,""),t=t.replace(/`/gi,""),t=t.replace(/^\//,"\\/"),t=t.replace(/(https?:\/\/[^ ]*)/g,"");const r=parsePage(t,e,document);console.log(r),window.open(`https://scrapbox.io/${encodeURIComponent(project_name)}/${encodeURIComponent(r.title.trim())}?body=${encodeURIComponent(r.body.join("\n"))}`)}})();
