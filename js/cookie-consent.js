document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, был ли уже добавлен баннер
    if (!document.querySelector('#cookie-consent-container')) {
        fetch('cookie-banner.html')
            .then(response => response.text())
            .then(html => {
                document.body.insertAdjacentHTML('beforeend', html);
                initCookieConsentLogic();
            })
            .catch(error => {
                console.error('Error loading cookie banner:', error);
            });
    } else {
        initCookieConsentLogic();
    }

    function initCookieConsentLogic() {
        // Проверяем, было ли уже дано согласие
        const consent = localStorage.getItem('cookieConsent');
        if (consent) {
            const consentData = JSON.parse(consent);
            if (consentData.analytics) {
                // Включаем Google Analytics
                if (typeof gtag === 'function') {
                    gtag('consent', 'update', {
                        'analytics_storage': 'granted'
                    });
                }
            } else {
                // Отключаем Google Analytics
                if (typeof gtag === 'function') {
                    gtag('consent', 'update', {
                        'analytics_storage': 'denied'
                    });
                }
            }
        } else {
            // Если согласия нет, показываем уведомление
            const cookieConsent = document.querySelector('#cookie-consent-container');
            if (cookieConsent) {
                cookieConsent.classList.add('visible');
            }
            // По умолчанию отключаем аналитику
            if (typeof gtag === 'function') {
                gtag('consent', 'update', {
                    'analytics_storage': 'denied'
                });
            }
        }

        // Обработчик для кнопки "Accept"
        const acceptButton = document.querySelector('#cookie-consent-container .cookie-consent-accept');
        if (acceptButton) {
            acceptButton.addEventListener('click', function() {
                // Сохраняем согласие
                localStorage.setItem('cookieConsent', JSON.stringify({
                    analytics: true,
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                }));
                
                // Скрываем уведомление
                const cookieConsent = document.querySelector('#cookie-consent-container');
                if (cookieConsent) {
                    cookieConsent.classList.remove('visible');
                }

                // Включаем Google Analytics
                if (typeof gtag === 'function') {
                    gtag('consent', 'update', {
                        'analytics_storage': 'granted'
                    });
                }
            });
        }

        // Обработчик для кнопки "Decline"
        const rejectButton = document.querySelector('#cookie-consent-container .cookie-consent-reject');
        if (rejectButton) {
            rejectButton.addEventListener('click', function() {
                // Сохраняем отказ
                localStorage.setItem('cookieConsent', JSON.stringify({
                    analytics: false,
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                }));
                
                // Скрываем уведомление
                const cookieConsent = document.querySelector('#cookie-consent-container');
                if (cookieConsent) {
                    cookieConsent.classList.remove('visible');
                }

                // Отключаем Google Analytics
                if (typeof gtag === 'function') {
                    gtag('consent', 'update', {
                        'analytics_storage': 'denied'
                    });
                }
            });
        }
    }
}); 