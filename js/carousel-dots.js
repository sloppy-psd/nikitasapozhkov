/**
 * Слайдер с точками (стиль Seed / ssr-carousel-dots):
 * — точки вместо цифр, видно количество слайдов
 * — анимация активной точки при смене слайда
 * — авто-переключение по таймеру
 * — ручное переключение по клику на точку или по клику по области слайда (влево/вправо)
 */

(function () {
  function initDotsCarousels() {
    if (typeof Flickity === 'undefined') return;

    var containers = document.querySelectorAll('.carousel-dots-container');
    containers.forEach(function (wrapper) {
      var carouselEl = wrapper.querySelector('.carousel');
      if (!carouselEl || wrapper.dataset.initialized === 'true') return;

      var flkty = new Flickity(carouselEl, {
        pageDots: true,
        prevNextButtons: false,
        wrapAround: true,
        adaptiveHeight: true,
        cellAlign: 'center',
        contain: true,
        fade: true,
        autoPlay: 5000,
        pauseAutoPlayOnHover: true,
        imagesLoaded: true,
        resize: true
      });

      wrapper.dataset.initialized = 'true';

      // Клик по левой/правой части слайда — предыдущий/следующий
      carouselEl.addEventListener('click', function (e) {
        var rect = carouselEl.getBoundingClientRect();
        var mid = rect.left + rect.width / 2;
        if (e.clientX < mid) flkty.previous();
        else flkty.next();
      });

      // Сброс авто-таймера после ручного переключения (Flickity делает это сам при клике на dot)
      flkty.on('select', function () {
        // при смене слайда точки обновляются и анимируются через CSS
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDotsCarousels);
  } else {
    initDotsCarousels();
  }
})();
