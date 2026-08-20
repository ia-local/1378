// pagination.js
const PaginationController = {
    itemsPerPage: 12,
    currentPage: 1,
    totalItems: 0,
    container: document.getElementById('pagination-list'),

    init: function(totalItems, renderCallback) {
        this.totalItems = totalItems;
        this.currentPage = 1;
        this.renderCallback = renderCallback;
        this.updateUI();
    },

    updateUI: function() {
        if (!this.container) return;
        this.container.innerHTML = '';
        
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        if (totalPages <= 1) return; // Pas de pagination si une seule page

        // Bouton Précédent
        const prevLi = document.createElement('li');
        prevLi.innerHTML = `<a class="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label" 
            ${this.currentPage === 1 ? 'aria-disabled="true"' : 'href="#"'} 
            title="Page précédente">Précédent</a>`;
        if (this.currentPage > 1) {
            prevLi.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(this.currentPage - 1);
            });
        }
        this.container.appendChild(prevLi);

        // Numéros de pages (Version simplifiée)
        for (let i = 1; i <= totalPages; i++) {
            // Afficher seulement quelques pages pour ne pas surcharger l'UI
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                const pageLi = document.createElement('li');
                const isCurrent = i === this.currentPage;
                pageLi.innerHTML = `<a class="fr-pagination__link" href="#" ${isCurrent ? 'aria-current="page"' : ''} title="Page ${i}">${i}</a>`;
                
                if (!isCurrent) {
                    pageLi.querySelector('a').addEventListener('click', (e) => {
                        e.preventDefault();
                        this.goToPage(i);
                    });
                }
                this.container.appendChild(pageLi);
            } else if (i === 2 && this.currentPage > 3) {
                this.container.insertAdjacentHTML('beforeend', '<li><a class="fr-pagination__link fr-displayed-lg">…</a></li>');
            } else if (i === totalPages - 1 && this.currentPage < totalPages - 2) {
                this.container.insertAdjacentHTML('beforeend', '<li><a class="fr-pagination__link fr-displayed-lg">…</a></li>');
            }
        }

        // Bouton Suivant
        const nextLi = document.createElement('li');
        nextLi.innerHTML = `<a class="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label" 
            ${this.currentPage === totalPages ? 'aria-disabled="true"' : 'href="#"'} 
            title="Page suivante">Suivant</a>`;
        if (this.currentPage < totalPages) {
            nextLi.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(this.currentPage + 1);
            });
        }
        this.container.appendChild(nextLi);
    },

    goToPage: function(page) {
        this.currentPage = page;
        this.updateUI();
        if (this.renderCallback) {
            // Calcule les index de début et de fin
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            this.renderCallback(start, end);
            
            // Remonter en haut des résultats
            document.getElementById('contenu').scrollIntoView({ behavior: 'smooth' });
        }
    }
};