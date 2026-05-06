/**
 * Embla Carousel — замена Flickity по всему сайту.
 * Два режима:
 * 1) .carousel-container — счётчик "1 – N", клик по левой/правой части слайда
 * 2) .carousel-dots-container — точки, авто-переключение, клик по точкам и по слайду
 */

(function () {
  if (typeof EmblaCarousel === 'undefined') return;

  var Autoplay = typeof EmblaCarouselAutoplay !== 'undefined' ? EmblaCarouselAutoplay : null;

  function migrateToEmblaStructure(container, slideClass, containerClass) {
    var carousel = container.querySelector(containerClass || '.carousel');
    if (!carousel || container.dataset.emblaMigrated === 'true') return null;

    var viewport = document.createElement('div');
    viewport.className = 'embla__viewport';

    var emblaContainer = document.createElement('div');
    emblaContainer.className = 'embla__container';

    var cells = carousel.querySelectorAll(slideClass || '.carousel-cell');
    cells.forEach(function (cell) {
      cell.classList.remove('carousel-cell');
      cell.classList.add('embla__slide');
      emblaContainer.appendChild(cell);
    });

    viewport.appendChild(emblaContainer);
    carousel.parentNode.replaceChild(viewport, carousel);
    container.dataset.emblaMigrated = 'true';
    return viewport;
  }

  function initClassicCarousels() {
    var containers = document.querySelectorAll('.carousel-container');
    containers.forEach(function (wrapper) {
      var viewport = migrateToEmblaStructure(wrapper, '.carousel-cell', '.carousel');
      if (!viewport) return;

      var emblaApi = EmblaCarousel(viewport, {
        loop: true,
        align: 'center',
        containScroll: 'trimSnaps',
        duration: 25
      });

      var statusEl = wrapper.querySelector('.carousel-status');
      function updateStatus() {
        if (statusEl) {
          var i = emblaApi.selectedScrollSnap() + 1;
          var n = emblaApi.scrollSnapList().length;
          statusEl.textContent = i + ' – ' + n;
        }
      }
      emblaApi.on('select', updateStatus);
      updateStatus();

      viewport.addEventListener('click', function (e) {
        var rect = viewport.getBoundingClientRect();
        if (e.clientX < rect.left + rect.width / 2) emblaApi.scrollPrev();
        else emblaApi.scrollNext();
      });
    });
  }

  function initDotsCarousels() {
    var containers = document.querySelectorAll('.carousel-dots-container');
    containers.forEach(function (wrapper) {
      var viewport = migrateToEmblaStructure(wrapper, '.carousel-cell', '.carousel');
      if (!viewport) return;

      var dotsRoot = wrapper.querySelector('.embla-dots');
      if (!dotsRoot) {
        dotsRoot = document.createElement('div');
        dotsRoot.className = 'embla-dots';
        dotsRoot.setAttribute('role', 'tablist');
        wrapper.appendChild(dotsRoot);
      }

      var plugins = [];
      if (Autoplay) plugins.push(Autoplay({ delay: 5000, stopOnInteraction: true }));

      var emblaApi = EmblaCarousel(viewport, {
        loop: true,
        align: 'center',
        containScroll: 'trimSnaps',
        duration: 25
      }, plugins);

      var slides = wrapper.querySelectorAll('.embla__slide');
      dotsRoot.innerHTML = '';
      slides.forEach(function (_, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'embla-dot';
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-label', 'Slide ' + (i + 1));
        btn.addEventListener('click', function () { emblaApi.scrollTo(i); });
        dotsRoot.appendChild(btn);
      });

      function updateDots() {
        var idx = emblaApi.selectedScrollSnap();
        dotsRoot.querySelectorAll('.embla-dot').forEach(function (dot, i) {
          dot.classList.toggle('is-selected', i === idx);
        });
      }
      emblaApi.on('select', updateDots);
      updateDots();

      viewport.addEventListener('click', function (e) {
        var rect = viewport.getBoundingClientRect();
        if (e.clientX < rect.left + rect.width / 2) emblaApi.scrollPrev();
        else emblaApi.scrollNext();
      });

      if (emblaApi.plugins().autoplay) emblaApi.plugins().autoplay.play();
    });
  }

  function init() {
    initClassicCarousels();
    initDotsCarousels();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
