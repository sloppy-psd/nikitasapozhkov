document.addEventListener('DOMContentLoaded', function() {
    const currentYear = new Date().getFullYear();
    const email = "info@nikitasapozhkov.com";

    const footerHTML = `
    <!-- FOOTER -->
    <footer class="foot">
        <div class="footer-grid">
            <div class="footer-col footer-slogan">
                <p><a class="footer-slogan-link" href="https://fontfacetype.com" target="_blank" rel="noopener noreferrer">For Those Who Care About Style<br>and Chase the Unexpected.</a> <span class="footer-year">© ${currentYear}</span></p>
            </div>

            <div class="footer-col footer-contact">
                <p class="footer-contact-cta">Let’s get in touch</p>
                <span id="emailCopy" class="footer-email-link">${email}</span>
            </div>

            <div class="footer-col footer-social">
                <a href="https://www.instagram.com/nikita_sapozhkov/?hl=en" target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href="https://www.are.na/nikita-sapozhkov/sapozhkovs-do" target="_blank" rel="noopener noreferrer">Are.na</a>
                <a href="https://www.linkedin.com/in/nikita-sapozhkov-187592281" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>

            <div class="footer-col footer-privacy">
                <a href="privacy-policy.html">Privacy Policy</a>
            </div>
        </div>
    </footer>
    <!-- FOOTER -->
    `;

    let footerContainer = document.querySelector('.foot');

    if (footerContainer) {
        footerContainer.outerHTML = footerHTML;
    } else {
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    setTimeout(() => {
        const emailCopy = document.getElementById('emailCopy');
        if (emailCopy) {
            emailCopy.style.cursor = 'pointer';
            emailCopy.addEventListener('click', function() {
                navigator.clipboard.writeText(email)
                    .then(() => {
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

    const footer = document.querySelector('.foot');
    if (footer) {
        footer.style.display = 'none';

        window.addEventListener('scroll', function() {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
                footer.style.display = 'flex';
            } else {
                footer.style.display = 'none';
            }
        });
    }
});
