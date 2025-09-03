const {drawTag} = require("charchem2/dist/utils/xml/drawTag");

const buildList = (part, locale, ctx, buildPart) => {
  // Здесь используются теги ul/li. Хотя это не совсем соответствует стилистике книги, где нумерация списков такая: (a)
  let cssType = "lower-latin";
  let tag = "ul";
  let start = undefined;
  if (/^\d+$/.test(part.nums)) {
    cssType = "decimal";
    tag = "ol";
    if (part.nums !== "1") start = part.nums;
  } else if (part.nums === "*") {
    cssType = "disc";
  }
  const attrs = {
    style: `list-style: ${cssType};`,
  };
  if (start) attrs.start = start;
  let res = drawTag(tag, attrs) + `\n`;
  part.items.forEach(item => {
    res += "<li>\n";
    res += item.map(para => buildPart(para, locale, ctx)).join("\n");
    res += "</li>\n";
  });
  res += `</${tag}>\n`;
  return res;
}

module.exports = {buildList}