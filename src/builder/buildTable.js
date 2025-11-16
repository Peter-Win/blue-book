const {translate} = require("../dictionary");
const {drawTag} = require("charchem2/dist/utils/xml/drawTag");

const buildTable = (part, locale, text, ctx, buildPart) => {
  const {tableId="", cells, cols, subtitle, cls="", sort} = part; 
  let tablePrefix = "";
  if (tableId) {
    const tblRef = `Table-${tableId}`;
    tablePrefix = `<a id="${tblRef}">${translate("Table", locale)} ${tableId}</a>`;
  }
  let topCls = "std-table-box";
  if (cls) topCls += " " + cls;
  let res = `<div class="${topCls}">`;
  res += `<div class="std-table-title">${tablePrefix} ${text}</div>`;
  if (subtitle.length > 0) {
    res += `<div class="std-table-subtitle">`;
    res += subtitle.map(p => buildPart(p, locale, ctx)).join("\n");
    res += `</div>`;
  }
  res += `<table class="std-table">\n`;

  // row structure:
  // - isHeader: boolean
  // - cells: Cell[]
  // cell structure:
  // - tag
  // - attrs
  // - content

  let rows = [];
  let curRow;

  // build rows
  let colIndex = 0;
  let rowspans = [];

  cells.forEach(cell => {
    if (colIndex === 0) {
      colIndex = rowspans.length;
      curRow = {
        isHeader: false,
        cells: [],
      }
      rows.push(curRow);
    }
    const cellAttrs = {}
    if (cell.colspan) {
      cellAttrs.colspan = String(cell.colspan);
    }
    if (cell.rowspan) {
      cellAttrs.rowspan = String(cell.rowspan);
      rowspans.push(cell.rowspan-1);
    }
    if (cell.cls) {
      cellAttrs["class"] = cell.cls;
    }
    curRow.cells.push({
      tag: cell.type,
      attrs: cellAttrs,
      content: cell.parts.map(cell => buildPart(cell, locale, ctx)).join("\n"),
    })
    colIndex += cell.colspan || 1;
    if (colIndex >= cols) {
      colIndex = 0;
      res += "</tr>\n";
      rowspans = rowspans.map(n => n-1).filter(n => n>=0);
      curRow.isHeader = curRow.cells.every(({tag}) => tag === "th");
    }
  });

  // possible sorting
  if (sort) {
    const header = rows.filter(({isHeader}) => isHeader);
    const lines = rows.filter(({isHeader}) => !isHeader);
    // в таком названии как (диаминометилиден)амино при сортировке нужно игнорировать скобки
    const getText = (row) => row.cells[0].content.replace(/\(/g, "");
    lines.sort((a, b) => getText(a).localeCompare(getText(b)));
    rows = [...header, ...lines];
  }

  // draw rows
  rows.forEach(row => {
    res += "<tr>\n";
    row.cells.forEach(({tag, attrs, content}) => {
      res += drawTag(tag, attrs) + `\n`;
      res += content + "\n";
      res += `</${tag}>\n`;      
    });
    res += "</tr>\n";
  })

  res += `</table>\n`;
  res += `</div>\n`;
  return res;
}

module.exports = {buildTable}