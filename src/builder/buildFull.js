const path = require("node:path");
const fs = require("node:fs");
const {copyFile, writeFile, readFile, access} = fs.promises; // require("node:fs/promises");
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
    terms: {}, // locale => terms dictionary
    goodRefs: 0,
    badRefs: 0,
    makeRef(refId) {
      // Вариант урла, который включает только якорь. То есть, предполагается что весь текст на одной странице.
      return "#" + encodeURIComponent(refId);
    },
  };
  await Promise.all(["en", "ru"].map(locale => buildLocal(
    locale, ctx, path.join(dstFolder, `${locale}.html`)
  )));
}

const isFileExists = async (fullName) => {
    try {
        await access(fullName, fs.constants.F_OK)
        return true
    } catch (e) {
        if (e.code === 'ENOENT') {
            return false
        }
        throw e
    }
}

const loadTerms = async (locale) => {
  const fullName = path.normalize(path.join(__dirname, "..", `terms.${locale}.json`));
  console.log("terms dictionary:", fullName);
  if (!await isFileExists(fullName)) {
    return {};
  }
  const text = await readFile(fullName, {encoding: "utf-8"});
  return JSON.parse(text);
}

const buildLocal = async (locale, ctx, fullName) => {
  ctx.terms = await loadTerms(locale);
  const {doc} = ctx;
  const textBlocks = doc.blocks.map(block => buildBlock(block, locale, ctx));
  const content = template({
    title: translate("BlueBook", locale),
    body: textBlocks.join("\n"),
  });
  await writeFile(fullName, content, {encoding: "utf-8"});
  const stat = (a, b) => {
    const sum = a + b;
    if (!sum) return "-";
    return `${a} (${(a*100/sum).toFixed(2)}%)`
  }
  if (locale==="en") {
    console.log(`good refs= ${stat(ctx.goodRefs, ctx.badRefs)}, bad refs= ${stat(ctx.badRefs, ctx.goodRefs)}`);
  }
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