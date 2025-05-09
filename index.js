const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Sert les fichiers statiques (HTML, JS)
app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
  console.log('Joueur connecté');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
