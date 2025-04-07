const {readFile} = require("node:fs/promises");
const {addPartToDocument, addBlockToDocument} = require("../docStruct/document");
const {createBlock} = require("../docStruct/blocks");

const parseFile = async (fullName, ctx) => {
  console.log("parseFile", fullName);
  const text = await readFile(fullName, {encoding: "utf-8"});
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    lines[i] = lines[i].trim();
  }
  const reader = {
    lines,
    curLineIndex: 0,
    ctx,
    get curLine() {
      return this.lines[this.curLineIndex] ?? "";
    },
    readLine() {
      const {curLine} = this;
      this.goNextLine();
      return curLine;
    },
    goNextLine() {
      this.curLineIndex++;
    },
    goPrevLine() {
      if (this.curLineIndex > 0) {
        this.curLineIndex--;
      }
    },
    get isEnd() {
      return this.curLineIndex >= this.lines.length;
    },
    error(msg, lineOffs) {
      const i = this.curLineIndex + lineOffs;
      throw Error(`Error in ${fullName} in line ${i}: ${msg}\n<${this.lines[i]}>`);
    },
  }
  while (!reader.isEnd) {
    onTopLevelCmd(reader);
  }
}

const onTopLevelCmd = (reader) => {
  const {curLine} = reader;
  if (!curLine) {
    reader.goNextLine();
    return;
  }
  if (curLine.startsWith("//")) {
    // comment
    reader.goNextLine();
    return;
  }
  const htmlPart = tryToHtml(curLine);
  if (htmlPart) {
    reader.goNextLine();
    addPartToDocument(reader.ctx.doc, htmlPart);
    return;
  }
  if (curLine[0] === "#") {
    onHeader(reader);
    return;
  }
  if (curLine.startsWith("@Table")) {
    parseTable(reader);
    return;
  }
  if (curLine.startsWith("@Examples")) {
    parseExamples(reader);
    return;
  }
  if (curLine.startsWith("@List")) {
    parseList(reader);
    return;
  }
  const resFig = /^@Fig\.\s+([\d\.]+)/.exec(curLine)
  if (resFig) {
    parseFig(reader, resFig[1]);
    return;
  }
  if (/^@p(\s|$)/.test(curLine)) {
    const part = onLocalParagraph("p", reader);
    addPartToDocument(reader.ctx.doc, part);
    const clsRes = /\s\.([-a-z\d]+)(\s|$)/.exec(curLine);
    if (clsRes) part.cls = clsRes[1];
    return;
  }
  if (/^@Content/.test(curLine)) {
    addPartToDocument(reader.ctx.doc, {
      type: "content",
      loc: {},
      params: {},
      mode: curLine.split(/\s/)[1],
      headerId: reader.ctx.doc.blocks.at(-1).header.headerId,
    });
    reader.goNextLine();
    return;
  }
  const locale = isLocale(curLine);
  if (locale) {
    const part = onLocalParagraph("p", reader);
    addPartToDocument(reader.ctx.doc, part);
    return;
  }

  console.log("???", curLine);
  const part = onLocalParagraph("div", reader);
  addPartToDocument(reader.ctx.doc, part);
  // reader.error("Unrecognized construction", 0);
}

const onHeader = (reader) => {
  const headerLine = reader.readLine();
  const h = onLocalParagraph("header", reader);
  h.headerId = headerLine.slice(1).trim();
  if (/^\([a-z]\)/.test(h.headerId)) {
    h.inline = true;
    h.refId = `${reader.prevHeaderId} ${h.headerId}`;
  } else {
    if (h.headerId.endsWith("+")) {
      h.headerId = h.headerId.slice(0, -1);
      h.inline = true;
    }
    reader.prevHeaderId = h.headerId;
  }
  const block = createBlock(h);
  addBlockToDocument(reader.ctx.doc, block);
}

const parseTable = (reader) => {
  const firstLine = reader.readLine();
  const res = /^@Table (\d+\.\d+)/.exec(firstLine);
  const part = onLocalParagraph("table", reader);
  part.cells = [];
  part.cols = 0;
  if (res) part.tableId = res[1];
  addPartToDocument(reader.ctx.doc, part);
  let curCell = null;
  while (!reader.isEnd) {
    const line = reader.readLine();
    if (line.trim() === "@EndTable") break;
    const r1 = /^@(th|td)/.exec(line);
    if (r1) {
      const type = r1[1];
      curCell = {
        type,
        parts: [],
      }
      const rcs = /colspan=(\d+)/.exec(line);
      if (rcs) {
        curCell.colspan = +rcs[1];
      }
      part.cells.push(curCell);
      if (line.includes(";") && !part.cols) {
        // Признак конца строки
        part.cols = part.cells.reduce((sum, cell) => sum + (cell.colspan || 1), 0);
      }
    } else {
      reader.goPrevLine();
    }
    if (curCell) {
      curCell.parts.push(onLocalParagraph("p", reader));
    }
  }
  if (!part.cols) {
    const tdPos = part.cells.findIndex(c => c.type === "td");
    part.cols = tdPos >= 0 ? tdPos : part.cells.length;
  }
}

const parseFig = (reader, figId) => {
  const firstLine = reader.readLine();
  const part = onLocalParagraph("fig", reader);
  addPartToDocument(reader.ctx.doc, part);
  part.figId = figId;
}

const parseList = (reader) => {
  const firstLine = reader.readLine();
  const chunks = firstLine.split(/\s/);
  const part = {
    type: "list",
    loc: {},
    params: {},
    items: [],
    nums: chunks[1],
  }
  addPartToDocument(reader.ctx.doc, part);
  let curItem = [];

  while (!reader.isEnd) {
    const line = reader.readLine();
    if (!line.trim()) continue;
    if (line.trim() === "@End") break;
    if (line.startsWith("@item")) {
      curItem = [];
      part.items.push(curItem);
      continue;
    }
    const itemPart = onLocalParagraph("p", reader);
    curItem.push(itemPart);
  }
}

const parseExamples = (reader) => {
  const firstLine = reader.readLine();
  const params = firstLine.split(/\s+/);
  const part = onLocalParagraph("examples", reader);
  const sCols = params.find(p => /^\d+$/.test(p));
  const noTitle = params.find(p => p === "--");
  const extCls = params.find(p => /^\.[-a-z\d]+$/.test(p));

  part.cells = [];
  part.cols = +sCols || 1;
  part.noTitle = !!noTitle;
  if (extCls) part.extCls = extCls.slice(1);
  addPartToDocument(reader.ctx.doc, part);

  let curCell = [];
  let cellBegin = false;
  while (!reader.isEnd) {
    const line = reader.readLine();
    if (line.trim() === "@End") break;
    if (/^@cell(\s|$)/.test(line)) {
      curCell = {p:[], v:{}};
      part.cells.push(curCell);
      line.split(/\s+/).forEach(p => {
        const res = /^(.+)=(.+)$/.exec(p);
        if (res) {
          curCell.v[res[1]] = res[2];
        }
      });
      cellBegin = true;
    }
    const htmlPart = tryToHtml(line);
    if (htmlPart) {
      curCell.p.push(htmlPart);
      continue;
    }  
    if (!cellBegin) reader.goPrevLine();
    const cellItem = onLocalParagraph("p", reader);
    curCell.p.push(cellItem);
    cellBegin = false;
  }
}

const tryToHtml = (line) => {
  if (line.startsWith("<div") || line.startsWith("</div")) {
    return {
      type: "html",
      loc: {},
      html: line,
    };
  }  
  return null;
}

const onLocalParagraph = (type, reader) => {
  let locale = "*";
  const locDict = {};
  const params = {};
  let curParam = "";
  while (!reader.isEnd) {
    let line = reader.readLine();
    if (!line) break; // пустая строка - конец абзаца
    if (line.startsWith("//")) continue; // comment

    const paramStart = checkParamDef(line);
    if (paramStart) { // Параметр
      curParam = paramStart.name;
      line = paramStart.line;
    } else {
      const newLocale = isLocale(line);
      if (newLocale) { // Начало новой локали
        locale = newLocale;
        curParam = "";
        line = lineAfterLocale(line, reader, -1);
      }
    }
    if (curParam) {
      params[curParam] = params[curParam] || "";
      if (params[curParam]) params[curParam] += " ";
      params[curParam] += line;
    } else {
      locDict[locale] = locDict[locale] || "";
      if (locDict[locale]) locDict[locale] += " ";
      locDict[locale] += line;
    }
  }
  const res = {
    type,
    loc: {},
    params: {},
  }
  Object.entries(locDict).forEach(([key, val]) => {
    res.loc[key] = makeChunksFromLine(val, (msg) => reader.error(msg, -1));
  })
  Object.entries(params).forEach(([key, val]) => {
    res.params[key] = makeChunksFromLine(val, (msg) => reader.error(msg, -1));
  });
  return res;
}

const checkParamDef = (line) => {
  const res = /^%\s*([A-Z\d]+)\s*:(.*)$/i.exec(line);
  if (!res) return null;
  return {
    name: res[1],
    line: res[2],
  }
} 

const isLocale = (line) => {
  if (line.startsWith("en:")) return "en";
  if (line.startsWith("ru:")) return "ru";
  if (line.startsWith("*:")) return "*";
  return false;
}

const lineAfterLocale = (line, reader, curLineOffs) => {
  const pos = line.indexOf(":");
  if (pos < 0) reader.error("Expected ':' character", curLineOffs);
  return line.slice(pos + 1);
}

const onPair = (chunks, pos, leftSign, rightSign, type) => {
  const {content} = chunks[pos];
  if (typeof content !== "string") return false;
  const leftPos = content.indexOf(leftSign);
  if (leftPos >= 0) {
    const startPos = leftPos + leftSign.length;
    const rightPos = content.indexOf(rightSign, startPos);
    if (rightPos >= 0) {
      const left = content.slice(0, leftPos);
      const code = content.slice(startPos, rightPos).trim();
      const right = content.slice(rightPos+rightSign.length);
      chunks.splice(pos, 1, {
        type: "text",
        content: left,
      });
      chunks.splice(pos + 1, 0, typeof type === "function" ? type(code) : {
        type,
        content: code,
      }, {
        type: "text",
        content: right,
      });
      return true;
    }
  }
  return false;
}

const replaceSingle = (chunks, pos, pattern, result) => {
  const {content} = chunks[pos];
  if (typeof content !== "string") return false;
  if (pattern instanceof RegExp) {
    const res = pattern.exec(content);
    if (!res) return false;
    const code = res[0];
    const left = content.slice(0, res.index);
    const right = content.slice(res.index + code.length);
    chunks.splice(pos, 1, {
      type: "text",
      content: left,
    }, result, {
      type: "text",
      content: right,
    });
    return true;
  }
  return false;
}

const makeChunksFromLine = (line, onError) => {
  const chunks = [{
    type: "text",
    content: line,
  }]
  // Сначала замена формул
  let i = 0;
  while (i < chunks.length) {
    const chunk = chunks[i];
    if (chunk.type === "text") {
      if (onPair(chunks, i, "<$", "$>", "formula")) continue;
      if (onPair(chunks, i, "<%", "%>", (name) => ({
        type: "param",
        content: name,
      }))) continue;
      if (onPair(chunks, i, "**", "**", "b")) continue;
      if (onPair(chunks, i, "_{", "}", "sub")) continue;
      if (onPair(chunks, i, "^{", "}", "sup")) continue;
      if (onPair(chunks, i, "_", "_", "i")) continue;
      if (replaceSingle(chunks, i, /-->/, {type: "arrowRight", content:"-->" })) continue;
    } else if (chunk.type in {sup:1,sub:1} && typeof chunk.content === "string") {
      const {content} = chunk;
      // Это уже костыль. Далее желательно найти нормальное решение
      if (/_.+_/.test(content)) {
        chunk.content = [
          {type: "text", content},
        ];
        onPair(chunk.content, 0, "_", "_", "i");
      }
    }
    i++;
  }
  return chunks.filter(chunk => !!chunk.content);
}

module.exports = {parseFile};