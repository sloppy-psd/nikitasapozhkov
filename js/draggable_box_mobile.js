let isDraggingMobile = false;
let draggedElementMobile = null;
let offsetXMobile, offsetYMobile;

function startDragMobile(e, element) {
  e.preventDefault();
  isDraggingMobile = true;
  draggedElementMobile = element;
  const touch = e.touches[0];
  offsetXMobile = touch.clientX - draggedElementMobile.getBoundingClientRect().left;
  offsetYMobile = touch.clientY - draggedElementMobile.getBoundingClientRect().top;

  document.addEventListener('touchmove', handleDragMobile);
  document.addEventListener('touchend', stopDragMobile);
}

function handleDragMobile(e) {
  if (isDraggingMobile) {
    const touch = e.touches[0];
    draggedElementMobile.style.left = touch.clientX - offsetXMobile + 'px';
    draggedElementMobile.style.top = touch.clientY - offsetYMobile + 'px';
  }
}

function stopDragMobile() {
  isDraggingMobile = false;
  draggedElementMobile = null;
  document.removeEventListener('touchmove', handleDragMobile);
  document.removeEventListener('touchend', stopDragMobile);
}

// Adding touch event listeners for dragging boxes on mobile
draggableBox1.addEventListener('touchstart', (e) => startDragMobile(e, draggableBox1));
draggableBox2.addEventListener('touchstart', (e) => startDragMobile(e, draggableBox2));

function toggleSize(textMessageId, draggableBoxId, hideButtonId) {
  const textMessage = document.getElementById(textMessageId);
  const draggableBox = document.getElementById(draggableBoxId);
  const hideButton = document.getElementById(hideButtonId);

  const isTextHidden = textMessage.style.display === 'none';

  if (isTextHidden) {
    textMessage.style.display = 'block';
    hideButton1.textContent = 'About';
    hideButton2.textContent = 'New case';
    
    draggableBox.style.background = '';
    draggableBox.style.backdropFilter = 'blur(5px)';
  } else {
    textMessage.style.display = 'none';
    hideButton1.textContent = 'About';
    hideButton2.textContent = 'New case';
    
    draggableBox.style.background = 'none';
    draggableBox.style.backdropFilter = 'none';
  }
}

// Adding click event listeners for buttons on both boxes
hideButton1.addEventListener('touchend', (e) => {
  e.preventDefault();
  toggleSize('textMessage1', 'draggableBox1', 'hideButton1');
});
hideButton2.addEventListener('touchend', (e) => {
  e.preventDefault();
  toggleSize('textMessage2', 'draggableBox2', 'hideButton2');
});

img_main_page.addEventListener('touchend', (e) => {
  e.preventDefault();
  // Assuming there is a function handleButtonClick defined somewhere
  handleButtonClick('projects_vetvi.html');
});
