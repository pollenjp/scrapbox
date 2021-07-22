export class CustomDate extends Date {
  format(format) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return format
      .replace("ddd", days[this.getDay()])
      .replace("yyyy", this.getFullYear())
      .replace("MM", ("0" + (this.getMonth() + 1)).slice(-2))
      .replace("dd", ("0" + this.getDate()).slice(-2))
      .replace("hh", ("0" + this.getHours()).slice(-2))
      .replace("mm", ("0" + this.getMinutes()).slice(-2))
      .replace("ss", ("0" + this.getSeconds()).slice(-2));
  }
}
