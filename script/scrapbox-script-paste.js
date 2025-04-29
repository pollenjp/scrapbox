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
    icon_str,
    custom_link_name = null,
    memo = null,
    path_list = null,
  }) {
    this.hostname = hostname;
    this.icon_str = icon_str;
    this.custom_link_name = custom_link_name;
    this.memo = memo;
    this.path_list = path_list;
  }
}

const urlToIconName = {
  evernote_web_link: new CustomUrlData({
    hostname: "share.evernote.com",
    icon_str: "",
    custom_link_name: `evernote-link`,
    memo: `[Evernote Scan Data] [Scan Data] #date${new CustomDatetime().format(
      "yyyy-MM-dd"
    )} `,
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
      console.log(
        `custom_url_data.custom_link_name = ${custom_url_data.custom_link_name}`
      );
      text = "";
      if (custom_url_data.icon_str) {
        text = `${custom_url_data.icon_str} `;
      }
      if (custom_url_data.custom_link_name) {
        text += `[${custom_url_data.custom_link_name} ${url.toString()}]`;
      } else {
        text += `[${url.toString()}]`;
      }

      if (custom_url_data.memo) {
        text += ` ${custom_url_data.memo}`;
      }

      text += "\n";

      console.log(text);
      break;
    }
  }

  insertText(text);
  return;
}

const isValidEvernoteAppLink = (text) => {
  var urlRegex = /(evernote:\/\/\/[^\s]+)/;
  var ret_val = text.match(urlRegex); // true or null
  if (ret_val) {
    return true;
  }
  return false;
};

function convertEvernoteLinkApp2Web(app_link) {
  let rx =
    /evernote:\/\/\/view\/(?<ID1>[0-9]+)\/(?<ID2>[a-zA-Z0-9-]+)\/(?<ID3>[a-zA-Z0-9-]+)\/(?<ID4>[a-zA-Z0-9-]+)(?<query>[\s]*)/;
  let match_groups = app_link.match(rx).groups;
  console.log(match_groups);
  return `https://share.evernote.com/note/${match_groups.ID3}`;
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

    if (isValidEvernoteAppLink(line)) {
      line = convertEvernoteLinkApp2Web(line);
    }

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
