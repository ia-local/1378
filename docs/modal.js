// modal.js
document.addEventListener('DOMContentLoaded', () => {
    const triggers = document.querySelectorAll('.trigger-modal');
    const modalImage = document.getElementById('modal-image');
    const modalCaption = document.getElementById('modal-caption');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            // Récupérer les données de l'élément cliqué
            const imgSrc = this.getAttribute('data-img-src');
            const imgAlt = this.getAttribute('data-img-alt');
            const imgDesc = this.getAttribute('data-img-desc');

            // Injecter dans la modale
            if (modalImage) {
                modalImage.src = imgSrc || '';
                modalImage.alt = imgAlt || 'Document comptable';
            }
            if (modalCaption) {
                modalCaption.textContent = imgDesc || '';
            }

            // Ouvrir la modale via l'API DSFR
            // Le DSFR écoute l'attribut aria-controls, mais on peut forcer l'ouverture en JS natif
            const modalElement = document.getElementById('preview-modal');
            if (modalElement && window.dsfr) {
               window.dsfr(modalElement).modal.disclose();
            }
        });
    });
});