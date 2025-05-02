const { translate } = require("../dictionary")
const { drawTag } = require("charchem2/dist/utils/xml/drawTag");

const buildExamples = (part, locale, text, ctx, buildPart) => {
  const {cols, specTitle, extCls} = part;
  let title = text || "";
  if (specTitle === "none") {
    title = "";
  } else if (specTitle === "single") {
    title = translate("Example", locale);
  } else if (!title) {
    const key = part.cells.length === 1 ? "Example" : "Examples";
    title = translate(key, locale);
  }
  let res = `<p>${title}</p>\n`;
  const clsList = ["std-table-box"];
  if (extCls) clsList.push(extCls);

  res += `<div class="${clsList.join(" ")}">\n`;
  res += `<table class="examples">\n`;
  let colIndex = 0;
  part.cells.forEach(cell => {
    const colspan = +cell.v.colspan || 1;
    if (colIndex === 0) {
      res += "<tr>\n";
    }
    const attrs = {};
    if (colspan > 1) {
      attrs.colspan = cell.v.colspan;
    }
    if (cell.v.cls) {
      attrs["class"] = cell.v.cls;
    }
    res += `${drawTag("td", attrs)}\n`;
    res += cell.p.map(it => buildPart(it, locale, ctx)).join("\n");
    res += "</td>\n";
    colIndex+=colspan;
    if (colIndex >= cols) {
      colIndex = 0;
      res += "</tr>";
    }
  });
  res += `</table>\n`;
  res += `</div>\n`;
  return res;
}

module.exports = {buildExamples}
