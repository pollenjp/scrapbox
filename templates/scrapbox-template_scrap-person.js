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

  const dateFormat = "yyyy-MM-dd";
  const dayFormat = "ddd";

  // page contents
  return `\
@${generate_random_string(20)}
#person 
#date${d.format(dateFormat)} 

[hr.icon]


`;
})();
