// ==========================================
// MODULE : Algorithme de Croisement de Données (Accord de Paris vs Coalition Fiscale)
// CONTEXTE : Répertoire GIT 1378 - Audit CNCCFP
// ==========================================

export async function initInvestigativeMap() {
    const map = L.map('map').setView([20.0, 0.0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors | Projet 1378'
    }).addTo(map);

    // --- ICÔNES DE CARTOGRAPHIE ---
    const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    const orangeIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    const greenIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    // Dictionnaire pour l'interaction liste -> carte
    const markersMap = new Map();

    try {
        console.log("[Système 1378] Lancement de l'algorithme de croisement financier...");
        
        const [parisResponse, taxResponse] = await Promise.all([
            fetch('./unfccc-parties-core.json'),
            fetch('./is_tax_coalition.json')
        ]);
        
        if (!parisResponse.ok) throw new Error("Fichier unfccc-parties-core.json introuvable.");
        if (!taxResponse.ok) throw new Error("Fichier is_tax_coalition.json introuvable.");
        
        const parisData = await parisResponse.json();
        const taxData = await taxResponse.json();

        if (!parisData || !Array.isArray(parisData.parties)) {
            throw new Error("Structure corrompue : La clé 'parties' est absente dans unfccc-parties-core.json");
        }
        if (!taxData || !Array.isArray(taxData.members)) {
            throw new Error("Structure corrompue : La clé 'members' est absente dans is_tax_coalition.json");
        }

        const taxCoalitionMap = new Map();
        taxData.members.forEach(member => {
            taxCoalitionMap.set(member.id, member);
        });

        const listParis = document.getElementById('list-paris');
        const listTax = document.getElementById('list-tax');
        if(listParis) listParis.innerHTML = '';
        if(listTax) listTax.innerHTML = '';

        // --- BOUCLE DE CROISEMENT ET GÉNÉRATION ---
        parisData.parties.forEach(party => {
            if (party.lat && party.lng) {
                const isTaxPayer = taxCoalitionMap.has(party.id);
                const taxDetails = isTaxPayer ? taxCoalitionMap.get(party.id) : null;
                
                // Détermination de la gravité fiscale
                let currentIcon = greenIcon;
                let statusBadge = `<span class="fr-badge fr-badge--success fr-badge--sm">Hors Taxe</span>`;
                let level = 'green';

                if (isTaxPayer) {
                    if (taxDetails.financial_impact === "Haut" || taxDetails.coalition_role.includes("Co-président") || taxDetails.coalition_role.includes("Actif")) {
                        currentIcon = redIcon;
                        statusBadge = `<span class="fr-badge fr-badge--error fr-badge--sm">Co-pilote / Taxe Active</span>`;
                        level = 'red';
                    } else {
                        currentIcon = orangeIcon;
                        statusBadge = `<span class="fr-badge fr-badge--warning fr-badge--sm">Signataire 4P</span>`;
                        level = 'orange';
                    }
                }

                const marker = L.marker([party.lat, party.lng], { icon: currentIcon }).addTo(map);
                markersMap.set(party.id, marker);

                // 1. Popup de la carte
                let popupContent = `
                    <div style="font-family: 'Marianne', sans-serif; min-width: 200px;">
                        <h4 style="margin:0 0 5px 0; font-size: 1.1rem;">
                            [#${party.seq_id}] ${party.country}
                        </h4>
                        <p style="margin: 0 0 8px 0;">${statusBadge}</p>
                        <strong>Ratification :</strong> ${party.ratification_date}<br>
                        <small><em>${party.notes_investigation || ''}</em></small>
                `;

                if (isTaxPayer) {
                    popupContent += `
                        <div style="margin-top:8px; padding:8px; background-color:${level === 'red' ? '#fee9e9' : '#ffe9d6'}; border-left:4px solid ${level === 'red' ? '#e1000f' : '#b35900'};">
                            <strong style="color:${level === 'red' ? '#e1000f' : '#b35900'};">Rôle 4P :</strong> ${taxDetails.coalition_role}<br>
                            <strong>Mécanismes :</strong> ${taxDetails.tax_mechanisms.join(', ')}<br>
                            <strong>Impact :</strong> ${taxDetails.financial_impact}
                        </div>
                    `;
                }
                popupContent += `</div>`;
                marker.bindPopup(popupContent);

                // 2. Onglet 1 : Accord de Paris (avec distinction visuelle immédiate)
                if (listParis) {
                    const li = document.createElement('li');
                    li.className = 'list-item-audit';
                    li.style.cursor = 'pointer';
                    li.style.padding = '8px 0';
                    li.style.borderBottom = '1px solid #e5e5e5';
                    li.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <strong>${party.country}</strong> <small>(${party.id})</small><br>
                                <small style="color:#666;">Ratifié : ${party.ratification_date}</small>
                            </div>
                            <div>${statusBadge}</div>
                        </div>
                    `;
                    li.addEventListener('click', () => {
                        map.setView([party.lat, party.lng], 5);
                        marker.openPopup();
                    });
                    listParis.appendChild(li);
                }
            }
        });

        // 3. Onglet 2 : Coalition Fiscale
        if (listTax) {
            taxData.members.forEach(member => {
                const li = document.createElement('li');
                li.className = 'list-item-audit';
                li.style.cursor = 'pointer';
                li.style.padding = '8px 0';
                li.style.borderBottom = '1px solid #e5e5e5';
                const isHigh = member.financial_impact === "Haut" || member.coalition_role.includes("Co-président");
                
                li.innerHTML = `
                    <div style="color: ${isHigh ? '#e1000f' : '#b35900'};">
                        <span class="fr-fi-money-euro-circle-fill" aria-hidden="true"></span>
                        <strong>${member.country}</strong> (${member.id}) - <em>${member.coalition_role}</em><br>
                        <small style="color:#333;">Mécanismes : ${member.tax_mechanisms.join(', ')}</small>
                    </div>
                `;
                li.addEventListener('click', () => {
                    const targetMarker = markersMap.get(member.id);
                    if (targetMarker) {
                        map.setView(targetMarker.getLatLng(), 5);
                        targetMarker.openPopup();
                    }
                });
                listTax.appendChild(li);
            });
        }

    } catch (error) {
        console.error("[ERREUR CRITIQUE] Algorithme de croisement interrompu :", error);
        document.getElementById('map').innerHTML = `<div style="padding:20px; color:red; font-family:sans-serif;"><b>Erreur de chargement des données d'audit.</b><br>${error.message}</div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof L !== 'undefined') initInvestigativeMap();
});