let isDragging = false;
let draggedElement = null;
let offsetX, offsetY;

function startDrag(e, element) {
  e.preventDefault();
  isDragging = true;
  draggedElement = element;
  offsetX = e.type.startsWith('touch') ? e.touches[0].clientX - draggedElement.getBoundingClientRect().left : e.clientX - draggedElement.getBoundingClientRect().left;
  offsetY = e.type.startsWith('touch') ? e.touches[0].clientY - draggedElement.getBoundingClientRect().top : e.clientY - draggedElement.getBoundingClientRect().top;

  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('touchmove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);
}

function handleDrag(e) {
  if (isDragging) {
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
    
    draggedElement.style.left = clientX - offsetX + 'px';
    draggedElement.style.top = clientY - offsetY + 'px';
  }
}

function stopDrag() {
  isDragging = false;
  draggedElement = null;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('touchmove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchend', stopDrag);
}

function handleButtonClick(link) {
  window.location.href = link;
}

// Adding event listeners for dragging boxes on desktop
draggableBox1.addEventListener('mousedown', (e) => startDrag(e, draggableBox1));
draggableBox2.addEventListener('mousedown', (e) => startDrag(e, draggableBox2));

// Adding touch event listeners for dragging boxes on mobile
draggableBox1.addEventListener('touchstart', (e) => startDrag(e, draggableBox1));
draggableBox2.addEventListener('touchstart', (e) => startDrag(e, draggableBox2));

// Adding click event listeners for buttons on both boxes
// hideButton1.addEventListener('click', () => handleButtonClick('your_link1.html'));
img_main_page.addEventListener('click', () => handleButtonClick('projects_vetvi.html'));




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













