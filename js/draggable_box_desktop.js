let isDragging = false;
let draggedElement = null;
let offsetX, offsetY;

function startDrag(e, element) {
  e.preventDefault();
  isDragging = true;
  draggedElement = element;
  offsetX = e.clientX - draggedElement.getBoundingClientRect().left;
  offsetY = e.clientY - draggedElement.getBoundingClientRect().top;

  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
}

function handleDrag(e) {
  if (isDragging) {
    draggedElement.style.left = e.clientX - offsetX + 'px';
    draggedElement.style.top = e.clientY - offsetY + 'px';
  }
}

function stopDrag() {
  isDragging = false;
  draggedElement = null;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
}

function handleButtonClick(link) {
  window.location.href = link;
}

// Adding event listeners for dragging boxes on desktop
draggableBox1.addEventListener('mousedown', (e) => startDrag(e, draggableBox1));
draggableBox2.addEventListener('mousedown', (e) => startDrag(e, draggableBox2));



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

// Adding click event listeners for buttons on both boxes
hideButton1.addEventListener('click', (e) => {
  e.preventDefault();
  // handleButtonClick('your_link1.html');
});

hideButton2.addEventListener('click', (e) => {
  e.preventDefault();
  // handleButtonClick('your_link2.html');
});
