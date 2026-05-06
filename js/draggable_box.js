let isDragging = false;
let hasMoved = false; // Флаг для отслеживания реального перемещения
let draggedElement = null;
let offsetX, offsetY;
let startX, startY; // Начальные координаты для определения движения
const DRAG_THRESHOLD = 5; // Минимальное расстояние в пикселях для определения drag

function startDrag(e, element) {
  e.preventDefault();
  isDragging = true;
  hasMoved = false; // Сбрасываем флаг движения при начале
  draggedElement = element;
  
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
  
  startX = clientX;
  startY = clientY;
  offsetX = clientX - draggedElement.getBoundingClientRect().left;
  offsetY = clientY - draggedElement.getBoundingClientRect().top;

  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('touchmove', handleDrag, { passive: false });
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);
}

function handleDrag(e) {
  if (isDragging) {
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
    
    // Проверяем, превышен ли порог движения
    const deltaX = Math.abs(clientX - startX);
    const deltaY = Math.abs(clientY - startY);
    
    if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
      hasMoved = true;
    }
    
    draggedElement.style.left = clientX - offsetX + 'px';
    draggedElement.style.top = clientY - offsetY + 'px';
    
    // Предотвращаем скролл на мобильных при перетаскивании
    if (e.type.startsWith('touch') && hasMoved) {
      e.preventDefault();
    }
  }
}

function stopDrag() {
  isDragging = false;
  draggedElement = null;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('touchmove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchend', stopDrag);
  
  // Сбрасываем флаг движения через небольшую задержку,
  // чтобы событие click успело проверить его
  setTimeout(() => {
    hasMoved = false;
  }, 100);
}

function handleButtonClick(link) {
  window.location.href = link;
}

// Блокируем переход по ссылкам внутри draggable блоков при перетаскивании
function preventLinkDuringDrag(e) {
  if (hasMoved) {
    e.preventDefault();
    e.stopPropagation();
  }
}

// Adding event listeners for dragging boxes on desktop
draggableBox1.addEventListener('mousedown', (e) => startDrag(e, draggableBox1));
draggableBox2.addEventListener('mousedown', (e) => startDrag(e, draggableBox2));

// Adding touch event listeners for dragging boxes on mobile
draggableBox1.addEventListener('touchstart', (e) => startDrag(e, draggableBox1), { passive: false });
draggableBox2.addEventListener('touchstart', (e) => startDrag(e, draggableBox2), { passive: false });

// Блокируем клики по ссылкам внутри draggable блоков при перетаскивании
const linksInDraggable = document.querySelectorAll('.draggableBox a');
linksInDraggable.forEach(link => {
  link.addEventListener('click', preventLinkDuringDrag);
});

// Для мобильных устройств - обработка img_main_page
if (typeof img_main_page !== 'undefined' && img_main_page) {
  img_main_page.addEventListener('click', (e) => {
    if (!hasMoved) {
      handleButtonClick('project_Lamoda.html');
    }
  });
}




function toggleSize(textMessageId, draggableBoxId) {
  const textMessage = document.getElementById(textMessageId);
  const draggableBox = document.getElementById(draggableBoxId);

  const isTextHidden = textMessage.style.display === 'none';

  if (isTextHidden) {
    textMessage.style.display = 'block';

    // hideButton1.textContent = 'About ↑';
        hideButton1.textContent = 'About';

    hideButton2.textContent = 'New case';

    draggableBox.style.background = '';
    draggableBox.style.backdropFilter = 'blur(5px)'; 

  } else {
    textMessage.style.display = 'none';

    // hideButton1.textContent = 'About ↓';
    hideButton1.textContent = 'About';
    hideButton2.textContent = 'New case';

    draggableBox.style.background = 'none';
    draggableBox.style.backdropFilter = 'none';
    

  }
}

// Adding touch and click event listeners for the hideButton
hideButton.addEventListener('click', () => handleButtonClick('textMessage', 'draggableBox'));

hideButton.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleButtonClick('textMessage', 'draggableBox');
});













