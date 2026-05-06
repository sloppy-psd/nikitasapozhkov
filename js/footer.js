document.addEventListener('DOMContentLoaded', function() {
    // Получаем текущий год для автоматического обновления даты
    const currentYear = new Date().getFullYear();
    const email = "info@nikitasapozhkov.com";
    
    // HTML-код футера
    const footerHTML = `
    <!-- FOOTER -->
    <footer class="foot">
        <div class="footer-grid">
            <!-- Колонка 1-2: Мотто -->
            <div class="footer-col footer-slogan">
                <p>For Those Who Care About Style<br>and Chase the Unexpected</p>
            </div>
            
            <!-- Колонка 3: пустая -->
            <div class="footer-col footer-empty"></div>
            
            <!-- Колонка 4: Соцсети (от центра) -->
            <div class="footer-col footer-social">
                <a href="https://www.instagram.com/nikita_sapozhkov/?hl=en" target="_blank">Instagram</a>
                <a href="https://www.are.na/nikita-sapozhkov/sapozhkovs-do" target="_blank">Are.na</a>
                <a href="https://t.me/typefather" target="_blank">Telegram</a>
                <a href="https://www.linkedin.com/in/nikita-sapozhkov-187592281" target="_blank">LinkedIn</a>
            </div>
            
            <!-- Колонка 5: Email -->
            <div class="footer-col footer-email">
                <p class="footer-label">E-mail</p>
                <span id="emailCopy" class="footer-email-link" style="cursor: pointer;">${email}</span>
            </div>
            
            <!-- Колонка 6: Копирайт -->
            <div class="footer-col footer-copyright">
                <p>© ${currentYear}, <a href="privacy-policy.html">Privacy Policy</a></p>
            </div>
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
    
    // Добавляем функциональность копирования email в буфер обмена
    setTimeout(() => {
        const emailCopy = document.getElementById('emailCopy');
        if (emailCopy) {
            emailCopy.addEventListener('click', function() {
                navigator.clipboard.writeText(email)
                    .then(() => {
                        // Показываем подтверждение копирования
                        const originalText = emailCopy.textContent;
                        emailCopy.textContent = 'Copied!';
                        setTimeout(() => {
                            emailCopy.textContent = originalText;
                        }, 1500);
                    })
                    .catch(err => {
                        console.error('Не удалось скопировать email: ', err);
                    });
            });
        }
    }, 100);

    // Добавляем логику отображения/скрытия футера при скролле
    const footer = document.querySelector('.foot');
    if (footer) {
        footer.style.display = 'none'; // Изначально скрываем футер

        window.addEventListener('scroll', function() {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
                footer.style.display = 'flex';
            } else {
                footer.style.display = 'none';
            }
        });
    }
}); 