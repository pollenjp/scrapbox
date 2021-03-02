// Unreal Engine TODO Twitter Clip
javascript: (function () {
  let project_name = "pollenJP-MEMO";
  let comment = "comment variable";
  let lines = [
    "[UnrealEngine TODO]",
    "#UnrealEngine [UnrealEngine.icon]",
    "#TODO [TODO.icon]",
    "",
    "[hr.icon]",
    "",
  ];

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
    OTHER: "",
  };

  comment = "// Get the Web Page Information //";

  let domain = window.location.hostname;
  let href = window.location.href;
  let title = window.prompt("Bookmark to Scrapbox", document.title);

  if (title == null) return;
  let document_title_str = document.title.replace("[", "").replace("]", "");
  let link =
    "[Web Page.icon] [Web Page: " + document_title_str + " " + href + "]";
  comment = "// add link //";
  lines.push(" " + link);

  comment = "// 引用文追加 //";

  var quote = window.getSelection().toString();
  if (quote.trim()) {
    lines = lines.concat(
      quote.split(/\n/g).map(function (line) {
        if (line !== "") {
          return "  > " + line;
        }
      })
    );
  }

  comment = "// 空白行の削除 //";

  lines = remove_empty_lines(lines);

  comment = "// add images //";

  let img_href_array;
  switch (domain) {
    case domains.TWITTER:
      function get_twitter_image_hrefs(images) {
        let img_href_array = [];
        images.forEach(function (img) {
          if (img.alt == "Image") {
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
    lines.push("[" + img_href + "]");
  });

  comment = "// Open the page //";

  var body = encodeURIComponent(lines.join("\n"));
  window.open(
    "https://scrapbox.io/" +
      encodeURIComponent(project_name) +
      "/" +
      encodeURIComponent(title.trim()) +
      "?body=" +
      body
  );
})();
