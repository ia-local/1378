// script_conversion.js (à exécuter avec: node script_conversion.js)
const xlsx = require('xlsx');
const fs = require('fs');

// 1. Lire le fichier Excel
const workbook = xlsx.readFile('LFI-2026-Credits-AE-et-CP-votes.xls');
const sheetName = workbook.SheetNames[0]; // Feuille LFIDetaillee
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// 2. Regrouper les données par Programme
const programmesMap = new Map();

data.forEach(row => {
    const codeProg = row['Programme'];
    if (!programmesMap.has(codeProg)) {
        programmesMap.set(codeProg, {
            code_mission: row['Code Mission'],
            mission: row['Mission'],
            code_programme: codeProg,
            libelle_programme: row['Libellé Programme'],
            ministere: row['Libellé Ministère'],
            total_ae: 0,
            total_cp: 0,
            actions: []
        });
    }
    
    let prog = programmesMap.get(codeProg);
    // Additionner les Crédits de Paiement et Autorisations d'Engagement
    prog.total_ae += row['AE (T2 + Hors T2) LFI  2026'] || 0;
    prog.total_cp += row['CP (T2 + Hors T2) LFI  2026'] || 0;
    
    // Garder une trace des actions spécifiques
    prog.actions.push({
        action: row['Libellé Action'],
        cp: row['CP (T2 + Hors T2) LFI  2026'] || 0
    });
});

// 3. Exporter en JSON
const jsonOutput = Array.from(programmesMap.values());
fs.writeFileSync('lfi_2026.json', JSON.stringify(jsonOutput, null, 2), 'utf-8');
console.log('Fichier lfi_2026.json généré avec succès !');