const {addPartToBlock} = require("./blocks");

const createDocument = () => {
  return {
    blocks: [],
    headersMap: {}, // headerId => block
    shortHeadersMap: {},
    formulasCount: 0,
  }
}

const addBlockToDocument = (doc, block) => {
  doc.blocks.push(block);
}

const addPartToDocument = (doc, part) => {
  const lastBlock = doc.blocks.at(-1);
  addPartToBlock(lastBlock, part);
}

module.exports = {createDocument, addBlockToDocument, addPartToDocument}