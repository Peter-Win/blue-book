const dictionary = {
  en: {
    BlueBook: "Blue Book",
    Example: "Example:",
    Examples: "Examples:",
    FigN: "Fig. #",
    Table: "Table",
  },
  ru: {
    BlueBook: "Синяя Книга",
    Example: "Пример:",
    Examples: "Примеры:",
    FigN: "Рис. #",
    Table: "Таблица",
  },
}

const translate = (key, locale) => {
  const lang = dictionary[locale];
  if (!lang) return key;
  return lang[key] ?? key;
}

module.exports = {dictionary, translate}