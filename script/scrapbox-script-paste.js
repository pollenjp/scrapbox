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
  atcoder: new CustomUrlData({
    hostname: "atcoder.jp",
    icon_str: "[(icon) AtCoder.icon]",
  }),
  connpass_web_link: new CustomUrlData({
    hostname: "connpass.com",
    icon_str: "[connpass.icon]",
  }),
  discord_web_link: new CustomUrlData({
    hostname: "discord.com",
    icon_str: "[Discord.icon]",
    memo: `#date${new CustomDatetime().format("yyyy-MM-dd")} `,
  }),
  connpass_web_link: new CustomUrlData({
    hostname: "hackmd.io",
    icon_str: "[(icon) HackMD.icon]",
  }),
  amazon_co_jp: new CustomUrlData({
    hostname: "www.amazon.co.jp",
    icon_str: "[Amazon.icon]",
  }),
  github: new CustomUrlData({
    hostname: "github.com",
    icon_str: "[GitHub.icon]",
  }),
  github_gist: new CustomUrlData({
    hostname: "gist.github.com",
    icon_str: "[GitHub Gist.icon]",
  }),
  evernote_web_link: new CustomUrlData({
    hostname: "www.evernote.com",
    icon_str: "[Evernote.icon]",
    custom_link_name: `evernote-link`,
    memo: `[Evernote Scan Data] [Scan Data] #date${new CustomDatetime().format(
      "yyyy-MM-dd"
    )} `,
  }),
  gitlab: new CustomUrlData({
    hostname: "gitlab.com",
    icon_str: "[GitLab.icon]",
  }),
  google_photo: new CustomUrlData({
    hostname: "photos.google.com",
    icon_str: "[Google Photo.icon]",
  }),
  google_drive: new CustomUrlData({
    hostname: "drive.google.com",
    icon_str: "[Google Drive.icon]",
  }),
  google_docs: new CustomUrlData({
    hostname: "docs.google.com",
    icon_str: "[Google Docs.icon]",
    path_list: ["document"],
  }),
  google_sheets: new CustomUrlData({
    hostname: "docs.google.com",
    icon_str: "[Google Sheets (spreadsheet).icon]",
    path_list: ["spreadsheets"],
  }),
  google_slide: new CustomUrlData({
    hostname: "docs.google.com",
    icon_str: "[Google Slide.icon]",
    path_list: ["presentation"],
  }),
  hackmd: new CustomUrlData({
    hostname: "hackmd.IO",
    icon_str: "[HackMD.icon]",
  }),
  jp_gr_kmc: new CustomUrlData({
    hostname: "kmc.gr.jp",
    icon_str: "[(icon) KMC.icon]",
  }),
  jp_gr_kmc_inside: new CustomUrlData({
    hostname: "inside.kmc.gr.jp",
    icon_str: "[(icon) KMC.icon]",
  }),
  pypi: new CustomUrlData({
    hostname: "pypi.org",
    icon_str: "[PyPI.icon]",
  }),
  niconico: new CustomUrlData({
    hostname: "www.nicovideo.jp",
    icon_str: "[NicoNico.icon]",
  }),
  paperswithcode: new CustomUrlData({
    hostname: "paperswithcode.com",
    icon_str: "[@paperswithcode Papers with Code.icon]",
  }),
  pixiv: new CustomUrlData({
    hostname: "www.pixiv.net",
    icon_str: "[(icon) pixiv.icon]",
  }),
  qiita: new CustomUrlData({
    hostname: "qiita.com",
    icon_str: "[Qiita.icon]",
  }),
  twitter: new CustomUrlData({
    hostname: "twitter.com",
    icon_str: "[Twitter.icon]",
  }),
  twitter_mobile: new CustomUrlData({
    hostname: "mobile.twitter.com",
    icon_str: "[Twitter.icon]",
  }),
  youtube: new CustomUrlData({
    hostname: "www.youtube.com",
    icon_str: "[YouTube.icon]",
  }),
  zenn: new CustomUrlData({
    hostname: "zenn.dev",
    icon_str: "[Zenn.icon]",
  }),
  // tmp
  MoodleSophia: new CustomUrlData({
    hostname: "moodle.cc.sophia.ac.jp",
    icon_str: "[Moodle.icon]",
  }),
};
function insertUrl(url) {
  console.log("insertUrl was called!");
  let text = `[${decodeURI(url.toString())}]`;
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
      if (custom_url_data.custom_link_name) {
        text = `${custom_url_data.icon_str} [${
          custom_url_data.custom_link_name
        } ${url.toString()}]`;
      } else {
        text = `${custom_url_data.icon_str} [${url.toString()}]`;
      }

      if (custom_url_data.memo) {
        text += ` ${custom_url_data.memo}`;
      }

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
  return `https://www.evernote.com/shard/${match_groups.ID2}/nl/${match_groups.ID1}/${match_groups.ID3}`;
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
      let url = new URL(line);
      console.log(url.toString());
      if (url.hostname == SCRAPBOX_URL_HOSTNAME) {
        insertScrapboxUrl(url, event);
      } else {
        insertUrl(url);

        if (url.hostname == urlToIconName["twitter"].hostname) {
          insertText("\n");
        } else {
          event.preventDefault();
        }
      }
    }
  }
  return;
});
