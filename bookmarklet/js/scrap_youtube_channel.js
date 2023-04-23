javascript: (function () {
  let project_name = "pollenJP-MEMO";
  let comment = "comment variable";

  comment = "// get page info //";

  const domain = window.location.hostname;
  const href = window.location.href;

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
    "@",
    "[ボカロP]",
    "[PERSON]",
    "[date" + date_str + "] ",
    "",
  ];

  comment = "// line body //";

  let lines_body = [];

  let document_title_str = document.title.replace("[", "").replace("]", "");
  let link = "[" + href + "]";
  comment = "// add link //";
  lines_body.push(document_title_str);
  lines_body.push(link);

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
