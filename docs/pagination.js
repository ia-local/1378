// pagination.js
document.addEventListener('DOMContentLoaded', () => {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    let currentIndex = 0;
    let totalYears = 6; // D'après app.js

    // Écouter les changements d'année provenant de app.js
    document.addEventListener('yearChanged', (e) => {
        currentIndex = e.detail.currentIndex;
        totalYears = e.detail.total;
        updatePaginationUI();
    });

    function updatePaginationUI() {
        // Gérer le bouton Précédent
        if (currentIndex === 0) {
            btnPrev.setAttribute('aria-disabled', 'true');
            btnPrev.removeAttribute('href');
        } else {
            btnPrev.removeAttribute('aria-disabled');
            btnPrev.setAttribute('href', '#');
        }

        // Gérer le bouton Suivant
        if (currentIndex === totalYears - 1) {
            btnNext.setAttribute('aria-disabled', 'true');
            btnNext.removeAttribute('href');
        } else {
            btnNext.removeAttribute('aria-disabled');
            btnNext.setAttribute('href', '#');
        }
    }

    // Actions sur les boutons
    btnPrev.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentIndex > 0 && window.routeToYear) {
            window.routeToYear(currentIndex - 1);
        }
    });

    btnNext.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentIndex < totalYears - 1 && window.routeToYear) {
            window.routeToYear(currentIndex + 1);
        }
    });
});