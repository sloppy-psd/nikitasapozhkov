(function($){
	

	$(document).ready(function(){
$('.carousel').flickity({
  // options
  cellAlign: 'center',
  contain: true,
  // adaptiveHeight: true,
  wrapAround: true,
  prevNextButtons: false,
  // selectedAttraction: 0.01,
  fade: true

});

$('.no-carousel').flickity({
  // options
  cellAlign: 'center',
  contain: true,
  // adaptiveHeight: true,
  wrapAround: false,
  prevNextButtons: false,
  // selectedAttraction: 0.01,
  pageDots: false,
  fade: false,


});

var $carousel = $('.carousel').flickity();

// previous wrapped
$('.button--previous-wrapped').on( 'click', function() {
  $carousel.flickity( 'previous', true );
});
// previous wrapped
$('.button--next-wrapped').on( 'click', function() {
  $carousel.flickity( 'next', true );
});

	});



})(jQuery)