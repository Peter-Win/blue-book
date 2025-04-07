const { translate } = require("../dictionary");
const { drawTag } = require("charchem2/dist/utils/xml/drawTag");

const buildFig = (part, locale, text, ctx, buildPart) => {
  const idTxt = translate("FigN", locale).replace("#", part.figId);
  const idRef = `Fig-${part.figId}`;
  const idTag = drawTag("a", {id: idRef}) + idTxt + "</a>"

  let title = `<div class="fig-title">${idTag} ${text}</div>`;
  return title;
}

module.exports = {buildFig}