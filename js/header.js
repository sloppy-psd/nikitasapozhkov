document.addEventListener('DOMContentLoaded', function() {
    // Название проекта для страницы (опционально): задаётся через data-header-project на <body>
    const projectName = document.body.getAttribute('data-header-project') || '';

    const projectBlock = projectName
        ? `
        <div class="header_project_name">
            <a>${projectName}</a>
        </div>`
        : '';

    const path = (window.location.pathname || '').toLowerCase();
    const isAbout = path.includes('about');
    const isProjects = (path.includes('project') || path.includes('projects')) && !path.includes('about');
    const projectsActive = isProjects ? ' header-nav-link-active' : '';
    const aboutActive = isAbout ? ' header-nav-link-active' : '';

    const headerHTML = `
    <!-- HEADER -->
    <nav class="header2">
        <div class="header_name_menu">
            <a href="index.html">Nikita Sapozhkov<br>Type and Graphic</a>
        </div>
        ${projectBlock}
        <div class="header_buttons_menu">
            <a href="projects.html" class="header-nav-link${projectsActive}">Projects</a>
            <a href="about.html" class="header-nav-link${aboutActive}">About</a>
        </div>
    </nav>
    <!-- HEADER -->
    `;

    const headerContainer = document.querySelector('.header2');

    if (headerContainer) {
        headerContainer.outerHTML = headerHTML;
    } else {
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    // Размер названия проекта = высота двух строк «Nikita Sapozhkov / Graphic and type», увеличен для читаемости
    function setProjectNameSize() {
        const nameBlock = document.querySelector('.header_name_menu');
        const projectBlockEl = document.querySelector('.header_project_name');
        if (nameBlock && projectBlockEl) {
            const twoLinesHeight = nameBlock.offsetHeight;
            const lineHeight = 1.2;
            const projectFontSize = (twoLinesHeight / lineHeight) * 1.2;
            projectBlockEl.style.fontSize = Math.min(84, Math.max(16, projectFontSize)) + 'px';
        }
    }

    setProjectNameSize();
    window.addEventListener('resize', setProjectNameSize);
});
