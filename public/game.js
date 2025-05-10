const socket = io(); // ou io("http://localhost:3000") si pas même origine
const playForm = document.getElementById('playForm');

function nouvellePartie(){
  socket.emit("nouvellePartie");
}

function changePlayForm(listBtns = null, raise = null, stack = null, callAmount = null){
  const btns = [];
  playForm.innerHTML = ''; // vider avant de recréer les boutons
	 listBtns.forEach(b => {
     if(b=="check"){
       const btn1 = document.createElement('button');
	                btn1.textContent = 'Check';
	                btn1.onclick = () => check();
	                btns.push(btn1);
     }

     if(b=="call"){
       const btn2 = document.createElement('button');
	                btn2.textContent = `Suivre ${callAmount - raise}`;
	                btn2.onclick = () => call();
                  btns.push(btn2);
       
     }

     if(b=="fall"){
	                const btn3 = document.createElement('button');
	                btn3.textContent = 'Se coucher';
	                btn3.onclick = () => fall();
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
		                toRaise(Number(curseur.value));
		            };
		
		            curseurContainer.appendChild(curseur);
		            curseurContainer.appendChild(valeur);
		            curseurContainer.appendChild(btnConfirmer);
					playForm.appendChild(curseurContainer);
				}
   })
  btns.forEach(b => playForm.appendChild(b));
}

function check(){
  socket.emit("nouvellePartie");
}

function call(){
  socket.emit("call");
}

function fall(){
  socket.emit("fall");
}

function toRaise(NB){
  socket.emit("toRaise", {
    nb: NB
  });
}

// Bouton
const bouton = document.createElement("button");
bouton.textContent = "Nouvelle partie";
bouton.addEventListener("click", nouvellePartie);
document.body.appendChild(bouton);
