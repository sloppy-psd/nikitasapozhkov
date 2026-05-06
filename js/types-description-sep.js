/**
 * Замена символа-разделителя ‖ (U+2016, double vertical line) на плашку .para-sep
 * в блоках .types-description. Вставляй в текст символ ‖ там, где нужна горизонтальная плашка между абзацами.
 */
document.addEventListener('DOMContentLoaded', function() {
  var sep = '\u2016'; // ‖
  var replacement = '<span class="para-sep"></span>';
  document.querySelectorAll('.types-description').forEach(function(el) {
    if (el.innerHTML.indexOf(sep) !== -1) {
      el.innerHTML = el.innerHTML.split(sep).join(replacement);
    }
  });
});
