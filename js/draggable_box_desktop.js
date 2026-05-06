let isDraggingDesktop = false;
let hasMovedDesktop = false; // Флаг для отслеживания реального перемещения
let draggedElementDesktop = null;
let offsetXDesktop, offsetYDesktop;
let startXDesktop, startYDesktop; // Начальные координаты
const DRAG_THRESHOLD_DESKTOP = 5; // Минимальное расстояние в пикселях

function startDragDesktop(e, element) {
  e.preventDefault();
  isDraggingDesktop = true;
  hasMovedDesktop = false;
  draggedElementDesktop = element;
  
  startXDesktop = e.clientX;
  startYDesktop = e.clientY;
  offsetXDesktop = e.clientX - draggedElementDesktop.getBoundingClientRect().left;
  offsetYDesktop = e.clientY - draggedElementDesktop.getBoundingClientRect().top;

  document.addEventListener('mousemove', handleDragDesktop);
  document.addEventListener('mouseup', stopDragDesktop);
}

function handleDragDesktop(e) {
  if (isDraggingDesktop) {
    // Проверяем, превышен ли порог движения
    const deltaX = Math.abs(e.clientX - startXDesktop);
    const deltaY = Math.abs(e.clientY - startYDesktop);
    
    if (deltaX > DRAG_THRESHOLD_DESKTOP || deltaY > DRAG_THRESHOLD_DESKTOP) {
      hasMovedDesktop = true;
    }
    
    draggedElementDesktop.style.left = e.clientX - offsetXDesktop + 'px';
    draggedElementDesktop.style.top = e.clientY - offsetYDesktop + 'px';
  }
}

function stopDragDesktop() {
  isDraggingDesktop = false;
  draggedElementDesktop = null;
  document.removeEventListener('mousemove', handleDragDesktop);
  document.removeEventListener('mouseup', stopDragDesktop);
  
  // Сбрасываем флаг движения через небольшую задержку
  setTimeout(() => {
    hasMovedDesktop = false;
  }, 100);
}

function handleButtonClickDesktop(link) {
  window.location.href = link;
}

// Adding event listeners for dragging boxes on desktop
draggableBox1.addEventListener('mousedown', (e) => startDragDesktop(e, draggableBox1));
draggableBox2.addEventListener('mousedown', (e) => startDragDesktop(e, draggableBox2));



function toggleSizeDesktop(textMessageId, draggableBoxId) {
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

// Adding click event listeners for buttons on both boxes
hideButton1.addEventListener('click', (e) => {
  e.preventDefault();
  // handleButtonClick('your_link1.html');
});

hideButton2.addEventListener('click', (e) => {
  e.preventDefault();
  // handleButtonClick('your_link2.html');
});
