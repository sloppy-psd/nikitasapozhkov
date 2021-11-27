var carouselContainers = document.querySelectorAll('.carousel-container');

for ( var i=0; i < carouselContainers.length; i++ ) {
  var container = carouselContainers[i];
  initCarouselContainer( container );
}

function initCarouselContainer( container ) {
  var carousel = container.querySelector('.carousel');
  var flkty = new Flickity( carousel, {
    // imagesLoaded: true,
    // percentPosition: false,
    pageDots: false,
    adaptiveHeight: true,
      cellAlign: 'left',
  contain: true,
  wrapAround: true,
  prevNextButtons: false,
  fade: true,

  });
  var carouselStatus = container.querySelector('.carousel-status');

  function updateStatus() {
    var slideNumber = flkty.selectedIndex + 1;
    carouselStatus.textContent = slideNumber + '–' + flkty.slides.length;
  }
  updateStatus();
  
  var previousButton = container.querySelector('.button--previous-wrapped');
  previousButton.addEventListener('click', function () {
    flkty.previous();
  });
  
  var nextButton = container.querySelector('.button--next-wrapped');
  nextButton.addEventListener('click', function () {
    flkty.next();
  });

  flkty.on( 'select', updateStatus );
  
}