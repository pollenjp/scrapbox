javascript: (function () {
  let project_name = "pollenJP-MEMO";
  let comment = "comment variable";

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

  const date_obj = new Date();
  const date_str = date_obj.format("yyyy-MM-dd");
  const scrapbox_page_title = "DailyReport " + date_str + " " + date_obj.format("ddd");
  let lines_header = [
    "#DailyReport",
    "[date" + date_str + "]",
    "",
    "TODO: このページのリンクを [DailyReport] に追加",
    "TODO: create [Notion.icon] [https://www.notion.so/]",
    "",
  ];

  comment = "// Open the page //";

  var body = encodeURIComponent(lines_header.join("\n"));
  window.open(
    "https://scrapbox.io/" +
      encodeURIComponent(project_name) +
      "/" +
      encodeURIComponent(scrapbox_page_title.trim()) +
      "?body=" +
      body
  );
})();
