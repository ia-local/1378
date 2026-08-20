// lfi.js
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('programmes-container');
    const searchInput = document.getElementById('search-input');
    let allProgrammes = [];

    // Formater les montants en Milliards ou Millions d'euros
    function formatCurrency(value) {
        if (value >= 1e9) {
            return (value / 1e9).toFixed(2) + ' Milliards €';
        } else if (value >= 1e6) {
            return (value / 1e6).toFixed(2) + ' Millions €';
        }
        return value.toLocaleString('fr-FR') + ' €';
    }

    async function fetchLFI() {
        try {
            const response = await fetch('lfi_2026.json');
            allProgrammes = await response.json();
            
            // Trier par budget décroissant par défaut
            allProgrammes.sort((a, b) => b.total_cp - a.total_cp);
            renderProgrammes(allProgrammes.slice(0, 50)); // Afficher le Top 50 par défaut pour la performance
        } catch (error) {
            console.error('Erreur LFI JSON:', error);
        }
    }

    function renderProgrammes(programmes) {
        container.innerHTML = '';
        programmes.forEach(prog => {
            const card = document.createElement('div');
            card.className = 'fr-col-12 fr-col-md-6 fr-col-lg-4';
            card.innerHTML = `
                <div class="fr-card fr-enlarge-link fr-card--sm">
                    <div class="fr-card__body">
                        <div class="fr-card__content">
                            <h3 class="fr-card__title">
                                <a href="programme.html?id=${prog.code_programme}">
                                    <span class="fr-text--bold">[Pr. ${prog.code_programme}]</span> ${prog.libelle_programme}
                                </a>
                            </h3>
                            <p class="fr-card__desc fr-text--sm fr-mt-2v">
                                <strong>Ministère :</strong> ${prog.ministere}<br>
                                <strong>Mission :</strong> ${prog.mission}
                            </p>
                            <div class="fr-card__end fr-mt-2w">
                                <p class="fr-text--sm fr-mb-0">Crédits de Paiement (CP) :</p>
                                <p class="budget-amount fr-mb-0">${formatCurrency(prog.total_cp)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Moteur de recherche en temps réel
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 2 && query.length > 0) return; // Attendre 2 caractères
        
        const filtered = allProgrammes.filter(prog => 
            prog.libelle_programme.toLowerCase().includes(query) || 
            prog.code_programme.toString().includes(query) ||
            prog.ministere.toLowerCase().includes(query)
        );
        renderProgrammes(filtered.slice(0, 50)); // Limiter à 50 résultats
    });

    fetchLFI();
});