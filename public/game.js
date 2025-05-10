const socket = io(); // ou io("http://localhost:3000") si pas même origine

function nouvellePartie(){
  socket.emit("nouvellePartie");
}


// Bouton
const bouton = document.createElement("button");
bouton.textContent = "Nouvelle partie";
bouton.addEventListener("click", nouvellePartie);
document.body.appendChild(bouton);
