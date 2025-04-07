const path = require("node:path");
const {copyFile, writeFile} = require("node:fs/promises");
const {buildBlock} = require("./buildBlock");
const {translate} = require("../dictionary");

const buildFull = async (doc, rootPath) => {
  const dstFolder = path.join(rootPath, "dst");
  const resourceFolder = path.join(rootPath, "resources");
  const resList = ["charchem.css", "blue-book.css", "charchem2.js", "charchem2.js.map", "blue-book.js"];
  await Promise.all(resList.map(name => copyFile(
    path.join(resourceFolder, name),
    path.join(dstFolder, name),
  )));
  const ctx = {
    doc,
    makeRef(refId) {
      // Вариант урла, который включает только якорь. То есть, предполагается что весь текст на одной странице.
      return "#" + encodeURIComponent(refId);
    },
  };
  await Promise.all(["en", "ru"].map(locale => buildLocal(
    locale, ctx, path.join(dstFolder, `${locale}.html`)
  )));
}

const buildLocal = async (locale, ctx, fullName) => {
  const {doc} = ctx;
  const textBlocks = doc.blocks.map(block => buildBlock(block, locale, ctx));
  const content = template({
    title: translate("BlueBook", locale),
    body: textBlocks.join("\n"),
  });
  await writeFile(fullName, content, {encoding: "utf-8"});
}

const template = ({title, body}) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <link href="./charchem.css" rel="stylesheet" />
  <link href="./blue-book.css" rel="stylesheet" />
  <script src="./charchem2.js"></script>
  <script src="./blue-book.js"></script>
</head>
<body class="echem-auto-compile">
${body}
</body>
</html>
`;

module.exports = {buildFull}