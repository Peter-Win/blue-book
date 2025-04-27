const { parseFolder } = require("./parseFolder");
const { rxPartReference } = require("../docStruct/headerId");

const parseAll = async (mainFolder, doc) => {
  await parseFolder(mainFolder, {doc});

  // Build headersMap
  doc.blocks.forEach(block => {
    const {header, parts} = block;
    const refId = header.refId || header.headerId;
    doc.headersMap[refId] = block;
  });

  // Create links to headers
  linkBlocks(doc.blocks, doc);
}

const linkBlocks = (blocks, doc) => {
  blocks.forEach(block => linkBlock(block, doc));
}

const linkBlock = (block, doc) => {
  const {header, parts} = block;
  if (header) linkPart(header, doc);
  parts.forEach(part => linkPart(part, doc));
}

const linkParts = (parts, doc) =>
  parts.forEach(part => linkPart(part, doc));

const linkPart = (part, doc) => {
  const {type} = part;
  Object.values(part.loc).forEach(chunks => linkChunks(chunks, doc));
  if (type === "examples") {
    part.cells.forEach(cell => {
      linkParts(cell.p, {...doc, ex:1});
    });
  } else if (type === "table") {
    linkBlocks(part.cells, doc);
    linkParts(part.subtitle, doc);
    // part.subtitle.forEach(b => linkBlock(b, doc));
  } else if (type === "list") {
    part.items.forEach(it => linkParts(it, doc));
  }
}

const linkChunks = (chunks, doc) => {
  const {headersMap} = doc;
  let i=0; 
  while (i<chunks.length) {
    const chunk = chunks[i++];
    if (chunk.type === "text") {
      const {content} = chunk;
      const res = rxPartReference.exec(content);
      if (res) {
        const hdrId = res[0];
        const left = content.slice(0, res.index);
        const right = content.slice(res.index + hdrId.length);
        chunks.splice(i-1, 1, {
          type: "text",
          content: left,
        }, {
          type: "refHdr",
          content: hdrId,
          part: headersMap[hdrId],
        }, {
          type: "text",
          content: right,
        });
        i++;
      }
    }
  }
}

module.exports = {parseAll}