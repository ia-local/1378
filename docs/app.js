// app.js
document.addEventListener('DOMContentLoaded', () => {
    const years = ['2018', '2019', '2020', '2021', '2022', '2023','2024'];
    let currentYearIndex = 0;

    const sections = document.querySelectorAll('.year-section');
    const navButtons = document.querySelectorAll('.nav-year-btn');

    // Fonction de routage principal
    window.routeToYear = function(index) {
        if (index < 0 || index >= years.length) return;
        
        currentYearIndex = index;
        const targetYear = years[currentYearIndex];

        // Mettre à jour l'affichage des sections
        sections.forEach(section => {
            if (section.getAttribute('data-year') === targetYear) {
                section.classList.add('is-active');
            } else {
                section.classList.remove('is-active');
            }
        });

        // Mettre à jour la surbrillance dans la navbar
        navButtons.forEach(btn => {
            if (btn.getAttribute('data-target-year') === targetYear) {
                btn.setAttribute('aria-expanded', 'true');
            } else {
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Déclencher un événement pour que la pagination se mette à jour
        document.dispatchEvent(new CustomEvent('yearChanged', { detail: { currentIndex: currentYearIndex, total: years.length }}));
    };

    // Écouteurs sur la NavBar
    navButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            window.routeToYear(index);
        });
    });

    // Initialisation
    window.routeToYear(0);
});