const socket = io(); // ou io("http://localhost:3000") si pas même origine
const playForm = document.getElementById('playForm');
const _ensembleJoueurs = document.getElementById("ensembleJoueurs");
const _river = document.getElementById("river");
const _riverAffiche = document.createElement("p");
_river.appendChild(_riverAffiche);
_riverAffiche.textContent = "River : ";

function nouvellePartie(){
  socket.emit("nouvellePartie");
}

function formatCard(card) {
    let val = card[0] > 10 ? name_face[card[0] - 11] : card[0];
    let suit = name_color[card[1] - 1];
    return `${val} of ${suit}`;
}

paragrapheByIdP = {}

function display(idP) {
        paragrapheByIdP[idP] = document.createElement("p");
        _ensembleJoueurs.appendChild(paragrapheByIdP[idP]);
        updateDisplay(IdP);
    }

function updateDisplay(IdP,name,stack,raise,state,hand) {
	paragraphByIdP[idP].textContent = `Nom: ${name}, Score: ${stack -raise}, Mise Totale : ${raise}, State : ${state}, Cartes: ${hand.map(formatCard).join(" | ")}`;
}

function afficheRiver(cards){
	_riverAffiche.textContent = "River : "
	cards.forEach(c=>{_riverAffiche.textContent =})
}

function changePlayForm(listBtns = null, raise = null, stack = null, callAmount = null, id){
  const btns = [];
  playForm.innerHTML = ''; // vider avant de recréer les boutons
	 listBtns.forEach(b => {
     if(b=="check"){
       const btn1 = document.createElement('button');
	                btn1.textContent = 'Check';
	                btn1.onclick = () => check(id);
	                btns.push(btn1);
     }

     if(b=="call"){
       const btn2 = document.createElement('button');
	                btn2.textContent = `Suivre ${callAmount - raise}`;
	                btn2.onclick = () => call(id);
                  btns.push(btn2);
       
     }

     if(b=="fall"){
	                const btn3 = document.createElement('button');
	                btn3.textContent = 'Se coucher';
	                btn3.onclick = () => fall(id);
                  btns.push(btn3);       
     }
     if(b=="curseur"){
                const curseurContainer = document.createElement('div');
		            const curseur = document.createElement('input');
		            curseur.type = 'range';
		            curseur.min = callAmount - raise;
		            curseur.max = stack - raise;
		            curseur.value = 0;
		
		            const valeur = document.createElement('span');
		            valeur.textContent = curseur.value;
		
		            curseur.addEventListener('input', () => {
		                valeur.textContent = curseur.value;
		            });
		
		            const btnConfirmer = document.createElement('button');
		            btnConfirmer.textContent = 'Confirmer';
		            btnConfirmer.onclick = () => {
		                toRaise(Number(id, curseur.value));
		            };
		
		            curseurContainer.appendChild(curseur);
		            curseurContainer.appendChild(valeur);
		            curseurContainer.appendChild(btnConfirmer);
					playForm.appendChild(curseurContainer);
				}
   })
  btns.forEach(b => playForm.appendChild(b));
}

function check(id){
  socket.emit("nouvellePartie", {id: id});
}

function call(id){
  socket.emit("call", {id: id});
}

function fall(id){
  socket.emit("fall", {id: id});
}

function toRaise(id,nb){
  socket.emit("toRaise", {
    nb: nb,
    id: id
  });
}

// Bouton
const bouton = document.createElement("button");
bouton.textContent = "Nouvelle partie";
bouton.addEventListener("click", nouvellePartie);
document.body.appendChild(bouton);
