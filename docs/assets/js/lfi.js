// lfi.js
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('programmes-container');
    const searchInput = document.getElementById('search-input');
    
    let allProgrammes = [];
    let currentFilteredList = [];

    // Récupération des données générées par votre script Node.js
    async function fetchLFI() {
        try {
            const response = await fetch('lfi_2026.json');
            allProgrammes = await response.json();
            
            // Trier par budget (CP) décroissant par défaut
            allProgrammes.sort((a, b) => b.total_cp - a.total_cp);
            currentFilteredList = [...allProgrammes];
            
            initDisplay();
        } catch (error) {
            console.error('Erreur LFI JSON:', error);
            container.innerHTML = '<div class="fr-col-12"><div class="fr-alert fr-alert--error"><p>Erreur de chargement des données budgétaires.</p></div></div>';
        }
    }

    function initDisplay() {
        PaginationController.init(currentFilteredList.length, (start, end) => {
            renderCards(currentFilteredList.slice(start, end));
        });
        
        // Afficher la première page
        PaginationController.goToPage(1);
    }

    function renderCards(programmesSlice) {
        container.innerHTML = '';
        
        if (programmesSlice.length === 0) {
            container.innerHTML = '<div class="fr-col-12"><p class="fr-text--lead fr-mt-4w">Aucun programme trouvé pour cette recherche.</p></div>';
            return;
        }

        programmesSlice.forEach(prog => {
            const card = document.createElement('div');
            card.className = 'fr-col-12 fr-col-md-6 fr-col-lg-4';
            
            card.innerHTML = `
                <div class="fr-card fr-card--sm card-clickable" tabindex="0" role="button" aria-label="Ouvrir les détails du programme ${prog.code_programme}">
                    <div class="fr-card__body">
                        <div class="fr-card__content">
                            <h3 class="fr-card__title">
                                <span class="fr-text--bold">[Pr. ${prog.code_programme}]</span> ${prog.libelle_programme}
                            </h3>
                            <p class="fr-card__desc fr-text--sm fr-mt-2v">
                                <strong>Mission :</strong> ${prog.mission}
                            </p>
                            <div class="fr-card__end fr-mt-2w">
                                <p class="budget-amount fr-mb-0">${FormatUtils.currency(prog.total_cp)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Écouteur d'événement pour ouvrir la modale
            card.querySelector('.card-clickable').addEventListener('click', () => {
                ModalController.openProgramModal(prog);
            });
            
            // Accessibilité : Ouverture avec Entrée/Espace
            card.querySelector('.card-clickable').addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    ModalController.openProgramModal(prog);
                }
            });

            container.appendChild(card);
        });
    }

    // Gestion de la recherche
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === '') {
            currentFilteredList = [...allProgrammes];
        } else {
            currentFilteredList = allProgrammes.filter(prog => 
                prog.libelle_programme.toLowerCase().includes(query) || 
                prog.code_programme.toString().includes(query) ||
                prog.mission.toLowerCase().includes(query)
            );
        }
        
        initDisplay(); // Réinitialiser la pagination et l'affichage avec la nouvelle liste
    });

    fetchLFI();
});