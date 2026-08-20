// dictionnaire.js
document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('dictionnaire-body');
    const searchInput = document.getElementById('search-input');
    
    let dictionnaire = {};
    let listeProgrammes = [];

    // Chargement du fichier
    async function loadDictionnaire() {
        try {
            // Remplacez par le nom de votre fichier dictionnaire JSON généré
            const response = await fetch('dictionnaire_programmes.json'); 
            dictionnaire = await response.json();
            
            // Convertir le dictionnaire en tableau pour pouvoir le trier et le filtrer facilement
            listeProgrammes = Object.values(dictionnaire);
            
            // Trier par code programme (ordre croissant)
            listeProgrammes.sort((a, b) => parseInt(a.code) - parseInt(b.code));
            
            renderTable(listeProgrammes);
        } catch (error) {
            console.error("Erreur de chargement du dictionnaire:", error);
            tbody.innerHTML = '<tr><td colspan="4" class="fr-text--center fr-text--bold" style="color:red;">Erreur lors du chargement des données.</td></tr>';
        }
    }

    // Affichage dans le tableau
    function renderTable(programmes) {
        tbody.innerHTML = '';
        
        if (programmes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="fr-text--center">Aucun programme trouvé.</td></tr>';
            return;
        }

        programmes.forEach(prog => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="code-badge">${prog.code}</span></td>
                <td><strong>${prog.libelle}</strong></td>
                <td>${prog.mission}<br><span class="fr-text--sm fr-text--light">${prog.ministere}</span></td>
                <td class="fr-text--right"><strong>${FormatUtils.currency(prog.total_cp)}</strong></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Moteur de recherche du dictionnaire
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === '') {
            renderTable(listeProgrammes);
        } else {
            const filtered = listeProgrammes.filter(prog => 
                prog.code.toString().includes(query) ||
                prog.libelle.toLowerCase().includes(query) ||
                prog.mission.toLowerCase().includes(query)
            );
            renderTable(filtered);
        }
    });

    loadDictionnaire();
});