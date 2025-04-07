const { splitHeaderId, isNearHeader, joinHeaderId } = require("../docStruct/headerId");
const { buildLocalChunks } = require("./buildChunks");
const { drawTag } = require("charchem2/dist/utils/xml/drawTag");

const buildContent = (part, locale, ctx) => {
  const {headerId, mode} = part;
  const {doc} = ctx;

  const splitedBase = splitHeaderId(headerId);

  let isIncluded = block => isNearHeader(splitedBase, block.header.headerId);
  if (mode === "^") {
    // const ownerId = joinHeaderId(splitedBase.slice(0,-1));
    isIncluded = block => {
      const id = block.header.headerId;
      return id !== headerId && isNearHeader(splitedBase.slice(0,-1), id);
    };
  }

  const list = doc.blocks.filter(isIncluded);
  
  let result = `<ul>\n`;
  list.forEach(block => {
    const { headerId } = block.header;
    result += `  <li>`;
    result += drawTag("a", {href: ctx.makeRef(headerId)});
    result += headerId;
    result += " ";
    result += buildLocalChunks(block.header.loc, locale, block.params, ctx);
    result += `</a></li>\n`;
  });
  result += `</ul>\n`;
  return result;
}

module.exports = {buildContent}