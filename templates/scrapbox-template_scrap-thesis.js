(function () {
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

  const d = new CustomDate();

  const dateFormat = "yyyyMMdd";

  // page contents
  return `\
【論文】 YYYY-MM-DD(論文v1提出日) 『${d.format(
    dateFormat
  )}${generate_random_string(20)}』
#Research
#論文 [parent.icon]

TODO: [論文]にこのページへのリンクを載せる.

code:text
 Submission history
 

 [arXiv.icon]
 	
 [IEEE.icon]
 	
 [GitHub.icon]
  
 [@paperswithcode Papers with Code.icon]
  
 

code:cite.txt
 

サムネイル

[** 内容まとめ]


`;
})();
