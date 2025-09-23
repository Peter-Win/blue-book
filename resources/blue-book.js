ChemSys.addDict({
  ru: {
    "common ring": "общее кольцо",
    "correct numbering": "корректная нумерация",
    "direction of lettering": "направление букв",
    "direction of numbering": "направление нумерации",
    "incorrect numbering": "некорректная нумерация",
    "rings": "колец",
  },
});

window.onload = function() {
  // Выявлен недостаток:
  // Когда формулы выведены в таблице, то при частичной компиляции таблица выглядит неправильно:
  // ещё не откомпилированные формулы, которые вне видимости, делают ячейки слишком широкими.
  // +-----------------------------------+-----------------------------+
  // | compiled                          | compiled                    |
  // | long uncompiled text ............ | long uncompiled text .......|
  // Частично проблема решена при помощи ограничения размеров в селекторе .echem-formula:not([data-src]) > *
  var echemObserver = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var elem = entry.target;
        ChemSys.draw(elem, elem.textContent ?? elem.innerText);
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.5});
  document.querySelectorAll('.echem-formula').forEach(function(item) {
    echemObserver.observe(item);
  });
}
