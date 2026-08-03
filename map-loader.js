// ==========================================
// MODULE : Chargement Asynchrone des 194 Parties de l'Accord de Paris
// CONTEXTE : Répertoire GIT 1378 - Audit CNCCFP
// ==========================================

export async function initParisAgreementMap() {
    // 1. Initialisation de la carte Leaflet (doit correspondre à <div id="map"></div> dans le HTML)
    const map = L.map('map').setView([20.0, 0.0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors | Source: UNFCCC'
    }).addTo(map);

    // Style de l'icône de base
    const defaultIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    try {
        console.log("[Système 1378] Début de la récupération asynchrone du registre UNFCCC...");
        
        // 2. Récupération asynchrone du fichier JSON local
        const response = await fetch('./unfccc-parties-core.json');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`[Système 1378] Registre chargé : ${data.total_parties} États souverains.`);
        console.log(`[Système 1378] Pays exclus statutairement : ${data.excluded.join(', ')}.`);

        // 3. Boucle de génération des marqueurs
        data.parties.forEach(party => {
            if (party.lat && party.lng) {
                const marker = L.marker([party.lat, party.lng], { icon: defaultIcon }).addTo(map);
                
                // Construction d'une popup structurée pour l'investigation
                const popupContent = `
                    <div style="font-family: 'Marianne', sans-serif;">
                        <h4 style="margin:0 0 5px 0;">${party.country} (${party.id})</h4>
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
        // Fallback visuel dans l'interface si le JSON est inaccessible
        document.getElementById('map').innerHTML = `<div style="padding:20px; color:red;">Erreur de chargement des données. Vérifiez l'accès à unfccc-parties-core.json. Détail : ${error.message}</div>`;
    }
}

// Lancement automatique si appelé directement
document.addEventListener('DOMContentLoaded', () => {
    if (typeof L !== 'undefined') {
        initParisAgreementMap();
    } else {
        console.warn("[Système 1378] La librairie Leaflet (L) n'est pas encore chargée.");
    }
});