const path = require("node:path");
const {parseAll} = require("./parser/parseAll");
const {createDocument} = require("./docStruct/document");
const {buildFull} = require("./builder/buildFull");

const doc = createDocument();

const main = async () => {
  const mainFolder = path.resolve("..", "book");
  console.log("Load...");
  await parseAll(mainFolder, doc);
  console.log("Build...");
  await buildFull(doc, path.resolve(__dirname, ".."));
  console.log("OK");
}

main().catch(e => {
  console.error(e);
})