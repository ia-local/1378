// programme.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Récupérer l'ID du programme dans l'URL (ex: programme.html?id=101)
    const urlParams = new URLSearchParams(window.location.search);
    const progId = urlParams.get('id');

    // 2. Cibler les éléments du DOM
    const elLoader = document.getElementById('prog-loader');
    const elContent = document.getElementById('prog-content');
    const elDetails = document.getElementById('prog-details');
    const elBreadcrumb = document.getElementById('breadcrumb-current');

    if (!progId) {
        showError("Aucun identifiant de programme spécifié dans l'URL.");
        return;
    }

    // 3. Charger les données et filtrer
    async function loadProgrammeData() {
        try {
            const response = await fetch('lfi_2026.json');
            if (!response.ok) throw new Error("Impossible de charger la base de données.");
            
            const data = await response.json();
            
            // Trouver le programme (conversion en chaîne pour éviter les problèmes de typage)
            const programme = data.find(p => p.code_programme.toString() === progId.toString());

            if (programme) {
                populateUI(programme);
            } else {
                showError(`Le programme n°${progId} est introuvable dans la Loi de Finances 2026.`);
            }
        } catch (error) {
            console.error(error);
            showError("Une erreur est survenue lors de l'extraction des données budgétaires.");
        }
    }

    // 4. Injecter les données dans l'interface
    function populateUI(prog) {
        // En-tête et Fil d'Ariane
        document.getElementById('prog-code').textContent = `Programme ${prog.code_programme}`;
        document.getElementById('prog-title').textContent = prog.libelle_programme;
        document.getElementById('prog-ministere').textContent = prog.ministere;
        document.getElementById('prog-mission').textContent = prog.mission;
        elBreadcrumb.textContent = `Programme ${prog.code_programme}`;

        // Données financières globales
        document.getElementById('prog-cp').textContent = FormatUtils.currency(prog.total_cp);
        document.getElementById('prog-ae').textContent = FormatUtils.currency(prog.total_ae);

        // Tableau des actions
        const actionsList = document.getElementById('prog-actions-list');
        actionsList.innerHTML = '';
        
        if (prog.actions && prog.actions.length > 0) {
            // Agréger les actions en cas de doublons potentiels dans l'extraction
            const actionsMap = new Map();
            prog.actions.forEach(act => {
                const actionName = act.action || "Action non spécifiée";
                actionsMap.set(actionName, (actionsMap.get(actionName) || 0) + act.cp);
            });

            actionsMap.forEach((cpValue, actionName) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${actionName}</td>
                    <td class="fr-text--right"><strong>${FormatUtils.currency(cpValue)}</strong></td>
                `;
                actionsList.appendChild(tr);
            });
        } else {
            actionsList.innerHTML = '<tr><td colspan="2" class="fr-text--center">Aucune subdivision par action disponible pour ce programme.</td></tr>';
        }

        // Basculer l'affichage
        elLoader.style.display = 'none';
        elContent.style.display = 'block';
        elDetails.style.display = 'block';
    }

    function showError(message) {
        elLoader.innerHTML = `
            <div class="fr-alert fr-alert--error">
                <h3 class="fr-alert__title">Erreur d'accès</h3>
                <p>${message}</p>
                <a href="LFI.html" class="fr-btn fr-mt-2w">Retourner à l'explorateur</a>
            </div>
        `;
    }

    // Lancer la procédure
    loadProgrammeData();
});