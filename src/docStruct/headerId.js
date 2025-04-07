// Идентификатор заголовка
// - Всегда начинается с "P-"

// К сожалению, химия - не точная наука :)
// Поэтому P-10 встречается два раза
// Top level: P-10 PARENT STRUCTURES FOR NATURAL PRODUCTS AND RELATED COMPOUNDS 
// и Introduction для P-1 GENERAL PRINCIPLES, RULES, AND CONVENTIONS
// Хорошо что P-10 - последний раздел верхнего уровня
// В тексте ссылки на верхнеуровневый раздел выглядят как "Chapter P-10", 
// но это тоже не точно, т.к. есть и "Chapters P-6 to P-10"
// Так как Chapter P-10 всё-таки встречается чаще, то решено его оставить
// А изменению подлежит Introduction для P-1.
// Вместо 0 нужен какой-то символ, который в ASCII находится до 0. Пусть будет #

// - Разделы верхнего уровня: P-1 ... P-10  - Либо одна цифра, либо 10
// - Разделы второго уровня: P-11, P-20, P-21, P-101. Особый случай - P-1#
// - Разделы от 3 и ниже отделяются точкой

// Бывают заголовки в виде отдельного тега. А могут быть частью абзаца
// P-31.2.4 The prefix ‘dehydro’
// P-31.2.4.1 The subtractive prefix ‘dehydro’ is used to denote the removal of hydrogen atoms and the formation of 
// multiple bonds. Its use is very limited in systematic nomenclature of organic compounds. 


const rxHeaderId = /P-(\d+|1#)(\.\d+)*/;

// Могут быть ссылки с подпунктами P-14.4 (g)
const rxPartReference = /P-(\d+|1#)(\.\d+)*(\s\([a-z]\))?/;

const splitHeaderId = (headerId) => {
  const parts = headerId.slice(2).split(".");
  if (parts.length === 1) {
    if (/^(\d|10)$/.test(parts[0])) return parts;
  }
  const c0 = parts.shift();
  const first = c0.slice(0, -1);
  const second = c0.slice(-1);
  parts.unshift(second);
  parts.unshift(first);
  return parts;
}

const joinHeaderId = (list) => {
  let res = "P-" + list[0];
  if (list.length > 1) {
    res += list.slice(1).join(".");
  }
  return res;
}

const isNearHeader = (splitedBase, checkingId) => {
  const dst = splitHeaderId(checkingId);
  if (dst.length !== splitedBase.length + 1) return false;
  for (let i=0; i<splitedBase.length; i++) {
    if (dst[i] !== splitedBase[i]) return false;
  }
  return true;
}

module.exports = {rxHeaderId, rxPartReference, splitHeaderId, isNearHeader, joinHeaderId}
