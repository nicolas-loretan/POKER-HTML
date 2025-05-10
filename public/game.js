function nouvellePartie(){
}


// Bouton
const bouton = document.createElement("button");
bouton.textContent = "Nouvelle partie";
bouton.addEventListener("click", nouvellePartie);
document.body.appendChild(bouton);
