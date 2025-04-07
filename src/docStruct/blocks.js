
// Block structure
// header: Part & 
//   headerId: string; // f.e: P-10.1
//   inline?: boolean;
// parts: Part[];

// Part:
// type: p | table | td | th
// loc: Record<locale, Chunk[]>
// params: Record<string, Chunk[]>
// cls?: string
// (table) tableId: string
// (table) cols: number
// (table) cells: {type: td | th, parts: Part[]}[]

const createBlock = (header) => ({
  header,
  parts: [],
})

const addPartToBlock = (block, part) => {
  if (block) {
    block.parts.push(part);
  }
}

module.exports = {createBlock, addPartToBlock}