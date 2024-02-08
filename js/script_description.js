let isContentVisible = true;

function toggleContent() {
  const contentBlock = document.getElementById('contentBlock');

  if (isContentVisible) {
    contentBlock.style.display = 'none';
    document.getElementById('toggleContentButton').textContent = '↓';
  } else {
    contentBlock.style.display = 'block';
    document.getElementById('toggleContentButton').textContent = '↑';
  }

  isContentVisible = !isContentVisible;
}
