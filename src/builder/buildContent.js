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
  } else if (/^\+\d+(\.\d+)*$/.test(mode)) {
    const startPartId = "P-"+mode.slice(1);
    const srcPieces = splitHeaderId(startPartId);
    const srcLast = +srcPieces[srcPieces.length-1];
    isIncluded = block => {
      const id = block.header.headerId;
      const dstPieces = splitHeaderId(id);
      if (srcPieces.slice(0,-1).join() === dstPieces.slice(0,-1).join()) {
        const dstLast = +dstPieces[srcPieces.length-1];
        if (dstLast >= srcLast) {
          return true;
        }
      }
      return false;
    }
  }

  const list = doc.blocks.filter(isIncluded);

  
  let result = `<ul>\n`;
  list.forEach(block => {
    const { headerId } = block.header;
    const short = doc.shortHeadersMap[headerId];

    const loc = short ? short.loc : block.header.loc;
    const params = short ? short.params : block.params;

    result += `  <li>`;
    result += drawTag("a", {href: ctx.makeRef(headerId)});
    result += headerId;
    result += " ";
    result += buildLocalChunks(loc, locale, params, ctx);
    result += `</a></li>\n`;
  });
  result += `</ul>\n`;
  return result;
}

module.exports = {buildContent}