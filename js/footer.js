document.addEventListener('DOMContentLoaded', function() {
    // Получаем текущий год для автоматического обновления даты
    const currentYear = new Date().getFullYear();
    const email = "info@nikitasapozhkov.com";
    
    // HTML-код футера
    const footerHTML = `
    <!-- FOOTER -->
    <footer class="foot">
        <!-- <img class="ns-lettering" src="img/ns-lettering.svg"> -->
        <div class="footer-info">
            <h1 style="flex-grow: 1">© All rights Reserved by Nikita Sapozhkov, ${currentYear}</h1>
            <h1 style="flex-grow: 1"><button class="btn-default" id="emailButton">${email}</button></h1>
        </div>
    </footer>
    <!-- FOOTER -->
    `;
    
    // Находим элемент footer или создаем div с классом "footer-container"
    let footerContainer = document.querySelector('.foot');
    
    // Если футер уже существует, заменяем его содержимое
    if (footerContainer) {
        footerContainer.outerHTML = footerHTML;
    } else {
        // Если футера нет, добавляем его перед закрывающим тегом body
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
    
    // Добавляем функциональность копирования email без уведомления
    setTimeout(() => {
        const emailButton = document.getElementById('emailButton');
        if (emailButton) {
            emailButton.addEventListener('click', function() {
                navigator.clipboard.writeText(email)
                    .catch(err => {
                        console.error('Не удалось скопировать email: ', err);
                    });
            });
        }
    }, 100);
}); 