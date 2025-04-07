const { buildLocalChunks } = require("./buildChunks");
const { buildContent } = require("./buildContent");
const { buildExamples } = require("./buildExamples");
const { buildFig } = require("./buildFig");
const { buildList } = require("./buildList");
const { buildTable } = require("./buildTable");
const { drawTag } = require("charchem2/dist/utils/xml/drawTag");

const buildPart = (part, locale, ctx) => {
  const {type, loc, params, cls} = part;
  const text = buildLocalChunks(loc, locale, params, ctx);
  const attrs = {};
  if (cls) attrs["class"] = cls;
  if (type === "p" || type === "div") {
    return `${drawTag(type, attrs)}${text}</${type}>`;
  }
  if (type === "table") {
    return buildTable(part, locale, text, ctx, buildPart);
  }
  if (type === "examples") {
    return buildExamples(part, locale, text, ctx, buildPart);
  }
  if (type === "list") {
    return buildList(part, locale, ctx, buildPart);
  }
  if (type === "content") {
    return buildContent(part, locale, ctx);
  }
  if (type === "html") {
    return part.html + "\n";
  }
  if (type === "fig") {
    return buildFig(part, locale, text, ctx, buildPart);
  }
  return `<pre>${JSON.stringify(part)}</pre>`;
}

module.exports = {buildPart}; 