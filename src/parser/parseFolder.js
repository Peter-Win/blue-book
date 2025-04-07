const path = require("node:path");
const {readdir} = require("node:fs/promises");
const {parseFile} = require("./parseFile");

const parseFolder = async (fullName, ctx) => {
  const list = await readdir(fullName, {withFileTypes: true});
  for (item of list) {
    if (item.isDirectory()) {
      await parseFolder(path.join(fullName, item.name), ctx);
    } else {
      await parseFile(path.join(fullName, item.name), ctx);
    }
  }
};

module.exports = {parseFolder};