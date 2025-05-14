import { insertText } from "../scrapbox-insert-text/script.js";
import { isValidUrl } from "../scrapbox-script-is-valid-url/script.js";
import { CustomDatetime } from "../scrapbox-script-CustomDatetime/script.js";

var PROJECT_NAME = "pollenJP-Memo";
var SCRAPBOX_URL_HOSTNAME = "scrapbox.io";

function insertScrapboxUrl(url, event) {
  console.log("called insertScrapboxUrl()");
  if (url.hostname != SCRAPBOX_URL_HOSTNAME) {
    throw new Error(`${url} hostname is not ${SCRAPBOX_URL_HOSTNAME}`);
  }
  let url_elements = decodeURI(url.pathname).split("/").slice(1);
  let project_name = url_elements[0];

  if (project_name != PROJECT_NAME) {
    // default behavior when scrapbox url
    return;
  }

  // let text;
  // let page_title = url_elements[1];
  // if (page_title.substring(0, 1) == "@") {
  //   text = `[${page_title}.icon] [${page_title}]`;
  //   event.preventDefault();
  //   insertText(text);
  // }
}

class CustomUrlData {
  constructor({
    hostname,
    path_list = null,
    custom_parser = null,
  }) {
    this.hostname = hostname;
    this.path_list = path_list;
    /**
     * @typedef {function(URL): string} CustomParser
     * @param {URL} url - URLのパラメータ
     * @returns {string} - 文章に埋め込んだ際の文字列を返す
     */
    /**
     * @type {CustomParser}
     */
    this.custom_parser = custom_parser || ((url) => {
      return `${url.toString()}`;
    });
  }
}

const urlToIconName = {
  evernote_web_link: new CustomUrlData({
    hostname: "www.evernote.com",
    memo: `[Evernote Scan Data] [Scan Data] #date${new CustomDatetime().format(
      "yyyy-MM-dd"
    )} `,
    custom_parser: (url) => {
      /**
       * `https://www.evernote.com/shard/${match_groups.ID2}/nl/${match_groups.ID1}/${match_groups.ID3}`;
       */
      // ID3 は noteId
      /**
       * @type {string | undefined}
       */
      let noteId = url.pathname.split("/").at(5);
      let shareUrl = `https://share.evernote.com/note/${noteId}`;

      return `[evernote-link ${url.toString()}] [share-link ${shareUrl}] [Evernote Scan Data] [Scan Data] #date${
        new CustomDatetime().format(
          "yyyy-MM-dd"
        )
      } `;
    },
  }),
};

function insertUrl(url) {
  console.log("insertUrl was called!");
  let text = "";
  for (var key in urlToIconName) {
    console.log(`url.hostname = ${url.hostname}`);
    console.log(`urlToIconName[key].hostname = ${urlToIconName[key].hostname}`);
    if (url.hostname === urlToIconName[key].hostname) {
      console.log(
        `urlToIconName[key].path_list = ${urlToIconName[key].path_list}`
      );
      if (urlToIconName[key].path_list !== null) {
        let path_matched = true;
        let path_list = url.pathname.split("/");
        urlToIconName[key].path_list.forEach((elem, index) => {
          // Warning: path_list's first element is empty string, because pathname is started with '/' (root).
          console.log(elem, index);
          if (elem != path_list[index + 1]) {
            path_matched = false;
          }
        });
        if (!path_matched) {
          continue;
        }
      }
      var custom_url_data = urlToIconName[key];
      text = "";
      text += custom_url_data.custom_parser(url);

      text += "\n";

      console.log(text);
      break;
    }
  }

  insertText(text);
  return;
}

/**
 *
 * @param {string} app_link
 * @returns {string | null}
 */
function convertEvernoteLinkApp2Web(app_link) {
  let rx =
    /evernote:\/\/\/view\/(?<ID1>[0-9]+)\/(?<ID2>[a-zA-Z0-9-]+)\/(?<ID3>[a-zA-Z0-9-]+)\/(?<ID4>[a-zA-Z0-9-]+)(?<query>[\s]*)/;
  let match_groups = app_link.match(rx)?.groups;
  if (!match_groups) {
    return null;
  }
  console.log(match_groups);
  return `https://www.evernote.com/shard/${match_groups.ID2}/nl/${match_groups.ID1}/${match_groups.ID3}`;
  // return `https://share.evernote.com/note/${match_groups.ID3}`;
  // return `https://www.evernote.com/client/web#/notes/${match_groups.ID3}` // これは無効
}

document.addEventListener("paste", (event) => {
  const d = event.clipboardData;
  console.log(d.types);
  let text = d.getData("Text");
  let lines = text.split("\n");

  if (!text) {
    return;
  }

  console.log(text);
  console.log(lines);
  console.log("custom paste processing");

  if (lines.length == 1) {
    var line = lines[0];

    line = convertEvernoteLinkApp2Web(line) || line

    if (isValidUrl(line)) {
      console.log("isValidUrl(line) is true");
      let url = new URL(line);
      console.log(url.toString());
      if (url.hostname == SCRAPBOX_URL_HOSTNAME) {
        insertScrapboxUrl(url, event);
      } else {
        insertUrl(url);
      }
      // event.preventDefault();
    }
  }
  return;
});
