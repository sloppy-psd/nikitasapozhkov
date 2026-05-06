let isDraggingMobile = false;
let hasMovedMobile = false; // Флаг для отслеживания реального перемещения
let draggedElementMobile = null;
let offsetXMobile, offsetYMobile;
let startXMobile, startYMobile; // Начальные координаты
const DRAG_THRESHOLD_MOBILE = 10; // Порог для мобильных (чуть больше для тач)

function startDragMobile(e, element) {
  e.preventDefault();
  isDraggingMobile = true;
  hasMovedMobile = false;
  draggedElementMobile = element;
  const touch = e.touches[0];
  
  startXMobile = touch.clientX;
  startYMobile = touch.clientY;
  offsetXMobile = touch.clientX - draggedElementMobile.getBoundingClientRect().left;
  offsetYMobile = touch.clientY - draggedElementMobile.getBoundingClientRect().top;

  document.addEventListener('touchmove', handleDragMobile, { passive: false });
  document.addEventListener('touchend', stopDragMobile);
}

function handleDragMobile(e) {
  if (isDraggingMobile) {
    const touch = e.touches[0];
    
    // Проверяем, превышен ли порог движения
    const deltaX = Math.abs(touch.clientX - startXMobile);
    const deltaY = Math.abs(touch.clientY - startYMobile);
    
    if (deltaX > DRAG_THRESHOLD_MOBILE || deltaY > DRAG_THRESHOLD_MOBILE) {
      hasMovedMobile = true;
    }
    
    draggedElementMobile.style.left = touch.clientX - offsetXMobile + 'px';
    draggedElementMobile.style.top = touch.clientY - offsetYMobile + 'px';
    
    // Предотвращаем скролл при перетаскивании
    if (hasMovedMobile) {
      e.preventDefault();
    }
  }
}

function stopDragMobile() {
  isDraggingMobile = false;
  draggedElementMobile = null;
  document.removeEventListener('touchmove', handleDragMobile);
  document.removeEventListener('touchend', stopDragMobile);
  
  // Сбрасываем флаг движения через небольшую задержку
  setTimeout(() => {
    hasMovedMobile = false;
  }, 100);
}

// Adding touch event listeners for dragging boxes on mobile
draggableBox1.addEventListener('touchstart', (e) => startDragMobile(e, draggableBox1), { passive: false });
draggableBox2.addEventListener('touchstart', (e) => startDragMobile(e, draggableBox2), { passive: false });

function toggleSizeMobile(textMessageId, draggableBoxId, hideButtonId) {
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
  if (!hasMovedMobile) {
    e.preventDefault();
    toggleSizeMobile('textMessage1', 'draggableBox1', 'hideButton1');
  }
});
hideButton2.addEventListener('touchend', (e) => {
  if (!hasMovedMobile) {
    e.preventDefault();
    toggleSizeMobile('textMessage2', 'draggableBox2', 'hideButton2');
  }
});

// Обработка клика по изображению на мобильных
if (typeof img_main_page !== 'undefined' && img_main_page) {
  img_main_page.addEventListener('touchend', (e) => {
    if (!hasMovedMobile) {
      e.preventDefault();
      handleButtonClick('project_Lamoda.html');
    }
  });
}
