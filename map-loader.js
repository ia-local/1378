// ==========================================
// MODULE : Chargement Asynchrone des 195 Parties de l'Accord de Paris
// CONTEXTE : Répertoire GIT 1378 - Audit CNCCFP / Plaidoyer Kyoto
// ==========================================

export async function initParisAgreementMap() {
    // 1. Initialisation de la carte Leaflet
    const map = L.map('map').setView([20.0, 0.0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors | Source: UNFCCC'
    }).addTo(map);

    // 2. Style de l'icône - Forcé en VERT pour les co-signataires ciblés
    const greenIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    try {
        console.log("[Système 1378] Début de la récupération asynchrone du registre UNFCCC...");
        
        // 3. Récupération asynchrone du fichier JSON local
        const response = await fetch('./unfccc-parties-core.json');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`[Système 1378] Registre chargé : Cible de ${data.total_parties_target} entités.`);
        console.log(`[Système 1378] Objectif stratégique : ${data.strategic_objective}`);
        console.log(`[Système 1378] Pays exclus statutairement : ${data.excluded.join(', ')}.`);

        // 4. Boucle de génération des marqueurs avec le seq_id
        data.parties.forEach(party => {
            if (party.lat && party.lng) {
                const marker = L.marker([party.lat, party.lng], { icon: greenIcon }).addTo(map);
                
                // Construction d'une popup structurée incluant l'ID séquentiel pour le suivi
                const popupContent = `
                    <div style="font-family: 'Marianne', sans-serif;">
                        <h4 style="margin:0 0 5px 0;">
                            <span style="color:#27a659;">[#${party.seq_id}/${data.total_parties_target}]</span> 
                            ${party.country} (${party.id})
                        </h4>
                        <hr style="margin:5px 0; border:0; border-top:1px solid #ccc;">
                        <strong>Ratification:</strong> ${party.ratification_date}<br>
                        <strong>Région:</strong> ${party.region}<br>
                        ${party.notes_investigation ? `<strong style="color:#d63626;">Notes Audit:</strong> ${party.notes_investigation}` : ''}
                    </div>
                `;
                
                marker.bindPopup(popupContent);
            }
        });

    } catch (error) {
        console.error("[ERREUR CRITIQUE] Impossible de charger les données UNFCCC :", error);
        document.getElementById('map').innerHTML = `<div style="padding:20px; color:red; font-family: sans-serif;">Erreur de chargement des données de cartographie. Vérifiez l'accès au fichier JSON. Détail : ${error.message}</div>`;
    }
}

// Lancement automatique si le DOM est prêt et Leaflet chargé
document.addEventListener('DOMContentLoaded', () => {
    if (typeof L !== 'undefined') {
        initParisAgreementMap();
    } else {
        console.warn("[Système 1378] La librairie Leaflet (L) n'est pas chargée.");
    }
});