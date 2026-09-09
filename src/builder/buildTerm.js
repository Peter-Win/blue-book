/**
 * 
 * @param {string} code 
 * @param {Record<string, string>} dict 
 * @returns {string}
 */
const buildTerm = (code, dict) => {
  const key = code.toLowerCase().replace(/\s+/g, " ")
  if (key in dict) {
    let term = dict[key];
    if (/[A-Z]/.test(code[0])) {
      term = term.slice(0, 1).toUpperCase() + term.slice(1);
    }
    if (/-[A-Z]/.exec(code)) {
      // вариант, когда заглавная буква не первая, а после приставки с дефисом
      term = term.replace(/-(.)/, (c) => c.toUpperCase())
    }
    term = term.replace(/_([^_]*)_/g, "<i>$1</i>");
    return `<em class="term">${term}</em>`;
  }
  return `<span style="color: #F0C; font-weight: bold">${code}</span>`;
}

module.exports = {buildTerm}