javascript: (function () {
  let project_name = "pollenJP-MEMO";
  let comment = "comment variable";

  comment = "// random string generator //";

  function generate_random_string(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  comment = "// Date Class //";

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

  const date = new Date();
  let date_str = date.format("yyyy-MM-dd");

  const scrapbox_page_title =
    "MEMO" + date.format("yyyyMMddhhmmss") + generate_random_string(4);

  comment = "// top N lines //";

  let lines_header = [
    "",
    "[Scrap Tweet] ",
    "[Good Image Gallery] ",
    "[Stamp Image Gallery] ",
    "[Gallery] ",
    "[date" + date_str + "] ",
    "",
    "[hr.icon]",
    "",
  ];
  let lines_body = [];

  comment = "// remove empty lines //";

  function remove_empty_lines(lines) {
    let ret_lines = [];
    for (var i = 0; i < lines.length; ++i) {
      if (lines[i] !== undefined) {
        ret_lines.push(lines[i]);
      }
    }
    return ret_lines;
  }

  comment = "// Website Domain Enum //";

  const domains = {
    TWITTER: "twitter.com",
    TWITTER_MOBILE: "mobile.twitter.com",
    OTHER: "",
  };

  comment = "// Get the Web Page Information //";

  let domain = window.location.hostname;
  let href = window.location.href;

  let document_title_str = document.title.replace("[", "").replace("]", "");
  let link = "[" + href + "]";
  comment = "// add link //";
  lines_body.push(" " + document_title_str);
  lines_body.push(" " + link);

  comment = "// 引用文追加 //";

  var quote = window.getSelection().toString();
  if (quote.trim()) {
    lines_body = lines_body.concat(
      quote.split(/\n/g).map(function (line) {
        if (line !== "") {
          return "  > " + line;
        }
      })
    );
  }

  comment = "// 空白行の削除 //";

  lines_body = remove_empty_lines(lines_body);

  comment = "// 末尾に空白行追加 //";

  lines_body.push("");

  comment = "// add images //";

  let img_href_array;
  switch (domain) {
    case domains.TWITTER:
    case domains.TWITTER_MOBILE:
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

      let images = [].slice.call(document.querySelectorAll("img"));
      img_href_array = get_twitter_image_hrefs(images);
      break;

    default:
      img_href_array = [];
  }
  img_href_array.forEach(function (img_href) {
    lines_body.push("[" + img_href + "]");
    lines_body.push("");
  });

  comment = "// Open the page //";

  var body = encodeURIComponent(lines_header.concat(lines_body).join("\n"));
  window.open(
    "https://scrapbox.io/" +
      encodeURIComponent(project_name) +
      "/" +
      encodeURIComponent(scrapbox_page_title.trim()) +
      "?body=" +
      body
  );
})();
