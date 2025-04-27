const {translate} = require("../dictionary");
const {drawTag} = require("charchem2/dist/utils/xml/drawTag");

const buildTable = (part, locale, text, ctx, buildPart) => {
  const {tableId="", cells, cols, subtitle} = part; 
  let tablePrefix = "";
  if (tableId) {
    tablePrefix = `${translate("Table", locale)} ${tableId}`;
  }
  let res = `<div class="std-table-box">`;
  res += `<div class="std-table-title">${tablePrefix} ${text}</div>`;
  if (subtitle.length > 0) {
    res += `<div class="std-table-subtitle">`;
    // console.log(subtitle);
    res += subtitle.map(p => buildPart(p, locale, ctx)).join("\n");
    res += `</div>`;
  }
  res += `<table class="std-table">\n`;
  let colIndex = 0;
  cells.forEach(cell => {
    if (colIndex === 0) {
      res += "<tr>\n";
    }
    const cellAttrs = {}
    if (cell.colspan) {
      cellAttrs.colspan = String(cell.colspan);
    }
    if (cell.cls) {
      cellAttrs["class"] = cell.cls;
    }
    res += drawTag(cell.type, cellAttrs) + `\n`;
    res += cell.parts.map(cell => buildPart(cell, locale, ctx)).join("\n");
    res += `</${cell.type}>\n`;
    colIndex += cell.colspan || 1;
    if (colIndex >= cols) {
      colIndex = 0;
      res += "</tr>\n";
    }
  });
  res += `</table>\n`;
  res += `</div>\n`;
  return res;
}

module.exports = {buildTable}