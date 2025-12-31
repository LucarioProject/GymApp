window.applyTheme = function (theme) {
    const html = document.documentElement;
    const body = document.body;
    
    // Aplicar atributo data-theme al html
    html.setAttribute('data-theme', theme);
    
    // Aplicar clase dark-mode al body
    if (theme === 'dark') {
        body.classList.add('dark-mode');
        html.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
        html.classList.remove('dark-mode');
    }
    
    // Aplicar a todos los elementos con clase page
    const pageElements = document.querySelectorAll('.page');
    pageElements.forEach(el => {
        if (theme === 'dark') {
            el.classList.add('dark-mode');
        } else {
            el.classList.remove('dark-mode');
        }
    });
    
    // Aplicar a todos los elementos con clase welcome-card, measurements-container, etc.
    const cards = document.querySelectorAll('.welcome-card, .measurements-container, .measurement-form, .measurements-table');
    cards.forEach(el => {
        if (theme === 'dark') {
            el.classList.add('dark-mode');
        } else {
            el.classList.remove('dark-mode');
        }
    });
};

// Aplicar tema al cargar
window.addEventListener('DOMContentLoaded', function () {
    // El tema se aplicará desde Blazor después de cargar
});
