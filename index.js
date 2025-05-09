const express = require('express');
const path = require('path');
const app = express();

// 1) Sert automatiquement tous les fichiers de public/ (y compris testf.html)
app.use(express.static(path.join(__dirname, 'public')));

// 2) Facultatif : forcer la racine à rendre testf.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'testf.html'));
  console.log("test");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});

