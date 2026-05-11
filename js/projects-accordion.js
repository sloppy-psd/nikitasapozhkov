(function () {
  function initProjectsTablePreview() {
    var table = document.querySelector('.projects-table');
    var hoverPreview = document.querySelector('.projects-hover-preview');
    var hoverPreviewImage = hoverPreview ? hoverPreview.querySelector('img') : null;
    if (!table || !hoverPreview || !hoverPreviewImage) return;

    var rows = Array.prototype.slice.call(
      document.querySelectorAll('.projects-table__row[data-preview]')
    );

    function showHoverPreview(row) {
      var previewSrc = row.getAttribute('data-preview');
      if (!previewSrc) return;

      hoverPreviewImage.src = previewSrc;
      hoverPreview.style.top = table.offsetTop + table.offsetHeight / 2 + 'px';
      hoverPreview.classList.add('is-visible');
    }

    function hideHoverPreview() {
      hoverPreview.classList.remove('is-visible');
    }

    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        showHoverPreview(row);
      });
      row.addEventListener('mouseleave', hideHoverPreview);
      row.addEventListener('click', function () {
        var href = row.getAttribute('data-href');
        if (href) window.location.href = href;
      });
    });
  }

  function initProjectsPage() {
    initProjectsTablePreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectsPage);
  } else {
    initProjectsPage();
  }
})();
