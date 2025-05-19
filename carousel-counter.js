// Инициализация карусели
var carouselContainers = document.querySelectorAll('.carousel-container');

for (var i = 0; i < carouselContainers.length; i++) {
  var container = carouselContainers[i];
  initCarouselContainer(container);
}

function initCarouselContainer(container) {
  var carousel = container.querySelector('.carousel');
  var flkty = new Flickity(carousel, {
    pageDots: false,
    adaptiveHeight: false,
    cellAlign: 'center',
    contain: true,
    wrapAround: true,
    prevNextButtons: false,
    fade: true,
    resize: true,
    imagesLoaded: true // Добавляем загрузку изображений перед инициализацией
  });
  
  var carouselStatus = container.querySelector('.carousel-status');

  function updateStatus() {
    var slideNumber = flkty.selectedIndex + 1;
    carouselStatus.textContent = slideNumber + ' – ' + flkty.slides.length;
  }
  updateStatus();
  
  // Скрываем кнопки навигации
  var previousButton = container.querySelector('.button--previous-wrapped');
  var nextButton = container.querySelector('.button--next-wrapped');
  
  if (previousButton && nextButton) {
    previousButton.style.display = 'none';
    nextButton.style.display = 'none';
  }
  
  // Добавляем обработчик для клика по карусели
  carousel.addEventListener('click', function(event) {
    var carouselRect = carousel.getBoundingClientRect();
    var halfPoint = carouselRect.left + carouselRect.width / 2;
    
    if (event.clientX < halfPoint) {
      // Клик по левой части - предыдущий слайд
      flkty.previous();
    } else {
      // Клик по правой части - следующий слайд
      flkty.next();
    }
  });

  flkty.on('select', updateStatus);
  
  // Обновляем Flickity при загрузке страницы и при изменении размера окна
  window.addEventListener('load', function() {
    flkty.resize();
  });
  
  window.addEventListener('resize', function() {
    flkty.resize();
  });
}