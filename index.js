const express = require('express');
const path = require('path');
const app = express();

// Middleware pour servir les fichiers statiques du dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route pour '/accueil' qui sert 'accueil.html'
app.get('/accueil', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'accueil.html'));
  console.log("Client connecté à la page accueil");
});

// Route pour '/game' qui sert 'game.html'
app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
  console.log("Client connecté à la page game");
});

// Middleware pour gérer toutes les autres routes non définies
app.use((req, res) => {
  res.status(404).send('Erreur 404 : Page non trouvée');
  console.log(`Requête non reconnue : ${req.originalUrl}`);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});


