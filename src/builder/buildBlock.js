const {buildChunks} = require("./buildChunks");
const {splitHeaderId} = require("../docStruct/headerId");
const { buildPart } = require("./buildPart");
const { drawTag } = require("charchem2/dist/utils/xml/drawTag");

/**
 * 
 * @param {Block} block
 * @param {string} locale
 * @param {{doc:{blocks: Block[]}, makeRef: (headerId:string) => string}} ctx
 * @returns string 
 */
const buildBlock = (block, locale, ctx) => {
  const {headerId, refId, inline, loc, params} = block.header;
  const text = buildChunks(loc[locale], params, ctx);
  const parts = splitHeaderId(headerId);
  const level = Math.min(parts.length, 6);
  const tag = inline ? "p" : `h${level}`;
  const isVisibleId = parts[0] !== "0";
  const visibleId = (isVisibleId ? `${drawTag("a", {id: refId || headerId})}<b>${headerId}</b></a> ` : "")
    .replace("#", 0); // Специальный случай для P10. Intro
  const headerTag = `<${tag}>${visibleId}${text}</${tag}>`;

  const partTexts = block.parts.map(part => buildPart(part, locale, ctx));

  return `${headerTag}
  ${partTexts.join("\n")}`;
}

module.exports = {buildBlock};