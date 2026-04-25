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

  console.log("Formulas count: ", doc.formulasCount)
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
  const {headersMap, tablesMap} = doc;
  let i=0; 
  while (i<chunks.length) {
    const chunk = chunks[i++];
    if (chunk.type === "text") {
      const {content} = chunk;
      const res = rxPartReference.exec(content);
      if (res) {
        let hdrId = res[0];
        // Таки сложности потому что кроме конструкций P-xxx есть SP-xxx, которые не являются ссылками
        const ofs = hdrId.indexOf("P");
        hdrId = hdrId.slice(ofs);
        const left = content.slice(0, res.index+ofs);
        const right = content.slice(res.index + ofs + hdrId.length);
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
  i=0;
  while (i<chunks.length) {
    const chunk = chunks[i++];
    if (chunk.type === "text") {
      const {content} = chunk;
      let index=0;
      let fullName = "";
      let tableNumber = "";
      let srcLength = 0;
      // При извлечении из "Table 4.3." последняя точка не должна входить в ссылку
      const res1 = /Table ([\d\.]*\d+)/.exec(content);
      if (res1) {
        fullName = res1[0];
        srcLength = fullName.length;
        tableNumber = res1[1];
        index = res1.index;
      } else {
        const res2 = /&\[([^\s\d]*\s*([\d\.]+))\]/.exec(content);
        if (res2) {
          index = res2.index;
          srcLength = res2[0].length;
          fullName = res2[1];
          tableNumber = res2[2];
        }
      }
      if (tableNumber) {
        const left = content.slice(0, index);
        const right = content.slice(index + srcLength);
        chunks.splice(i-1, 1, {
          type: "text",
          content: left,
        }, {
          type: "refTable",
          content: fullName,
          tableNumber,
          part: tablesMap[tableNumber],
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