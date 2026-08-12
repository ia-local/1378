const express = require('express');
const path = require('path');

const app = express();
const PORT = 2027;

// Définition du chemin absolu vers le répertoire statique "docs"
const docsPath = path.join(__dirname, 'docs');

// Middleware pour servir tous les fichiers statiques (HTML, CSS, JS, JSON)
app.use(express.static(docsPath));

// Route de sécurité (Fallback) : redirige vers index.html si le fichier n'est pas trouvé
// Très utile si vous utilisez des modules JS ou une navigation interne
app.get('*', (req, res) => {
    res.sendFile(path.join(docsPath, 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`[Système 1378] Serveur d'investigation local actif`);
    console.log(`==================================================`);
    console.log(`▶ Cible des données : ${docsPath}`);
    console.log(`▶ Interface web     : http://localhost:${PORT}`);
    console.log(`==================================================`);
    console.log(`Appuyez sur CTRL+C pour arrêter le serveur.`);
});