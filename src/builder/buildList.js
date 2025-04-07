const {drawTag} = require("charchem2/dist/utils/xml/drawTag");

const buildList = (part, locale, ctx, buildPart) => {
  // Здесь используются теги ul/li. Хотя это не совсем соответствует стилистике книги, где нумерация списков такая: (a)
  let cssType = "lower-latin";
  if (part.nums === "1") {
    cssType = "decimal";
  }
  const style = `list-style: ${cssType};`;
  let res = drawTag("ul", {style}) + `\n`;
  part.items.forEach(item => {
    res += "<li>\n";
    res += item.map(para => buildPart(para, locale, ctx)).join("\n");
    res += "</li>\n";
  });
  res += `</ul>\n`;
  return res;
}

module.exports = {buildList}