// modal.js
const ModalController = {
    openProgramModal: function(programData) {
        // Ciblage des éléments DOM
        const title = document.getElementById('program-modal-title');
        const ministere = document.getElementById('modal-ministere');
        const mission = document.getElementById('modal-mission');
        const cp = document.getElementById('modal-cp');
        const ae = document.getElementById('modal-ae');
        const actionsList = document.getElementById('modal-actions-list');

        // Injection des données
        title.textContent = `[Pr. ${programData.code_programme}] ${programData.libelle_programme}`;
        ministere.textContent = programData.ministere;
        mission.textContent = programData.mission;
        
        cp.textContent = FormatUtils.currency(programData.total_cp);
        ae.textContent = FormatUtils.currency(programData.total_ae);

        // Injection des actions (sous-catégories du programme)
        actionsList.innerHTML = '';
        if (programData.actions && programData.actions.length > 0) {
            // Regrouper les actions pour éviter les doublons (si nécessaire)
            programData.actions.forEach(act => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${act.action}</td>
                    <td class="fr-text--right">${FormatUtils.currency(act.cp)}</td>
                `;
                actionsList.appendChild(tr);
            });
        } else {
            actionsList.innerHTML = '<tr><td colspan="2">Aucune action détaillée disponible.</td></tr>';
        }

        // Ouverture via l'API DSFR
        const modalElement = document.getElementById('program-modal');
        if (modalElement && window.dsfr) {
            window.dsfr(modalElement).modal.disclose();
        }
    }
};