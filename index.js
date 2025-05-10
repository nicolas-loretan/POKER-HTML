const express = require('express');
const path = require('path');
const app = express();

// 1) Sert automatiquement tous les fichiers de public/ (y compris testf.html)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
  console.log("client connécté à la page game");
});

app.get('/accueil', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'accueil.html'));
  console.log("client connécté à la page accueil");
});

app.get('/', (req, res) => {
  res.sendStatus(404);;
  console.log("le client à taper une url inconnue");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});

