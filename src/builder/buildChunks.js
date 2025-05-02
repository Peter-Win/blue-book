const { ChemSys } = require("charchem2");
const { drawTag } = require("charchem2/dist/utils/xml/drawTag");

/**
 * 
 * @param {{type: string; content: string | {}}[]} chunks 
 * @param {Record<string, {type: string; content: string | {}}[]>} params 
 * @param {{}} doc 
 */
const buildChunks = (chunks, params, doc) => {
  if (!chunks) return "";
  return chunks.map(chunk => buildChunk(chunk, params, doc)).join("");
}

const buildLocalChunks = (locs, locale, params, ctx) => {
  return buildChunks(locs[locale] ?? locs["*"] ?? locs.en, params, ctx)
}

const buildChunk = (chunk, params, ctx) => {
  const {type, content} = chunk;
  if (type === "text") {
    return content;
  }
  if (type === "formula") {
    return `<span class="echem-formula">${ChemSys.esc(content)}</span>`
  }
  if (type === "param") {
    const paramChunks = params[content];
    if (!paramChunks) return `<code style="color:red">${content}</code>`;
    return buildChunks(paramChunks, params, ctx);
  } 
  if (["b", "i", "sub", "sup"].includes(type)) {
    let text = content;
    if (Array.isArray(text)) {
      text = buildChunks(text, params, ctx);
    }
    return `<${type}>${text}</${type}>`;
  }
  if (type === "arrowRight") {
    return `<span class="arrow-right"></span>`;
  }
  if (type === "refHdr") {
    const attrs = {};
    if (chunk.part) {
      attrs.href = ctx.makeRef(content);
      attrs["class"] = "p-ref";
    } else {
      attrs["class"] = "wrong-part";
    }
    return drawTag("a", attrs) + content + `</a>`;
  }

  return `<strong style="color: red">${type}</strong>`;
}

module.exports = {buildChunks, buildLocalChunks};