const {drawTag} = require("charchem2/dist/utils/xml/drawTag");

const buildList = (part, locale, ctx, buildPart) => {
  // Здесь используются теги ul/li. Хотя это не совсем соответствует стилистике книги, где нумерация списков такая: (a)
  let cssType = undefined;
  let htmlType = "a";

  let tag = "ol";
  let start = undefined;
  if (/^\d+$/.test(part.nums)) {
    // cssType = "decimal";
    htmlType = "1";
    if (part.nums !== "1") start = part.nums;
  } else if (/^[a-z]$/.test(part.nums)) {
    if (part.nums !== "a") {
      start = String(part.nums.charCodeAt(0) - "a".charCodeAt(0) + 1);
    }
  } else if (part.nums === "*") {
    tag = "ul"
    cssType = "disc";
  }
  const attrs = {}
  if (cssType) attrs.style = `list-style: ${cssType};`;
  if (tag === "ol") {
    attrs.type = htmlType;
    if (start) attrs.start = start;
  }
  
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