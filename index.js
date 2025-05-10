const express = require('express');
const http = require('http'); // nécessaire pour créer le serveur
const path = require('path');
const { Server } = require('socket.io'); // importer socket.io

const app = express();
const server = http.createServer(app); // créer un vrai serveur http
const io = new Server(server, {
  cors: {
    origin: "*", // à adapter si besoin
    methods: ["GET", "POST"]
  }
});

const joueurParId = {}; // id privé
const joueurParIdP = {}; // id public

function generateRandomId() {
  const min = 1000000000;
  const max = 9999999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Namespace pour le jeu
const gameSpace = io.of("/game");

gameSpace.on("connection", (socket) => {
  console.log("Un client s'est connecté au jeu");

  socket.on("nouvellePartie", () => {
    console.log("Nouvelle partie demandée");
    // nouvellePartie(); // Assure-toi que cette fonction est bien définie
  });

  socket.on('check', (data) => {
    joueurParId[data.id]?.check?.(); // protection au cas où
  });

  socket.on('call', (data) => {
    joueurParId[data.id]?.call?.();
  });

  socket.on('fall', (data) => {
    joueurParId[data.id]?.fall?.();
  });

  socket.on('raise', (data) => {
    joueurParId[data.id]?.raise?.(data.nb);
  });

  socket.on("disconnect", () => {
    console.log("Un client s'est déconnecté du jeu");
  });
});

// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/accueil', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'accueil.html'));
  console.log("Client connecté à la page accueil");
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
  console.log("Client connecté à la page game");
});

app.get('/', (req, res) => {
  res.redirect('/accueil');
});

app.use((req, res) => {
  res.status(404).send('Erreur 404 : Page non trouvée');
  console.log(`Requête non reconnue : ${req.originalUrl}`);
});

// Démarrage du serveur HTTP avec socket.io branché dessus
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});



// ----- Classe Player
class Player {
    constructor(name, stack = 100) {
        this.name = name;
	this.hand = [];
        this.stack = stack;
        this.best = null;
        this.paragraph = null;
	this.state = "waiting";
	this.raise = 0;
	    
	let id = null
	while (id == null){
		id = generateRandomId()
		if (!(id in joueurParId)){
			this.id = id
		} else {id = null}
	}
	joueurParId[this.id] = this; // ajoute le joueur au dictionnaire avec comme clef son id

	let idP = null
	while (idP == null){
		idP = generateRandomId()
		if (!(idP in joueurParIdP)){
			this.idP = idP
		} else {idP = null}
	}
	joueurParIdP[this.idP] = this;
    }
	
	receiveCard(card) {
        this.hand.push(card);
    }

    resetHand() {
        this.hand = [];
        this.best = null;
    }
	
    display() {
	    io.on("connection", (socket) => {
  // Ici socket est défini
  socket.emit("display", {
			  IdP: this.IdP,
			});
});
    }

    updateDisplay() {
	    io.on("connection", (socket) => {
  // Ici socket est défini
  socket.emit("updateDisplay", {
			  IdP: this.IdP,
			  name: this.name,
			  stack: this.stack,
			  raise: this.raise,
			  state: this.state,
			  hand: this.hand	
			});
});
    }
	
	play() {
	    return new Promise(resolve => {
	        this._resolveTour = resolve; // on stocke le resolve pour plus tard
			
			if (this.raise == this.stack) {
				this.state = "all-in"
			}
			
	        if (this.state == "waiting") {
	            this.state = "playing";
			
	            const action = [];
	
	            if (callAmount == this.raise) {
	                action.push("check");
	            } else {
	                action.push("call", "fall");
	            }
				
		    if (callAmount < this.stack) {
		        action.push("curseur")
		    }
		io.on("connection", (socket) => {
  // Ici socket est défini
  socket.emit("changePlayForm", {
			  listBtns: btns,
			  raise: this.raise,
			  stack: this.stack,
			  callAmount: callAmount,
			  id: this.id
			});
});

			
		    this.updateDisplay();
	        } else {
			this.played()
			}
	    });
	}	

	played() {
		console.log(this.name + " a joué")
		mainPot()
	    if (this.state != "fold" && this.state != "all-in"){
	    	this.state = "waiting";
			}
		this.updateDisplay();
		io.on("connection", (socket) => {
  socket.emit("changePlayForm",{id:this.id});
});

	    if (this._resolveTour) {
	        this._resolveTour(); // débloque await player.play()
	        this._resolveTour = null;
	    }
	}

	
	fall() {
		this.state = "fold"
		this.played()
	}
	
	check() {
		this.played()
	}
	
	call() {
		if (this.stack <= callAmount){
			this.state = "all-in"
			this.raise = this.stack
		} else {
			this.raise = callAmount
		}
		this.played()
	}
	
	toRaise(nb) {
		if (this.raise + nb > this.stack){
			console.log("ERREUR : raise plus haut que ton max alors que c'est pas sensé etre possible")
		}
		this.raise += nb 
		callAmount = this.raise
		if (this.raise == this.stack){
			this.state = "all-in"
		}
		
		console.log("raise de " + nb)
		this.played()
	}
}

// Joueurs
let players = [
    new Player("Jean"),
    new Player("Thom", 300),
    new Player("Nico", 300),
    new Player("Flo")
];
let community = [];
const name_face = ["Jack", "Queen", "King", "Ace"];
const name_color = ["Heart", "Diamond", "Club", "Spade"];

const RANK_NAME = {
    1: "High Card", 2: "Pair", 3: "Two Pair", 4: "Three of a Kind", 5: "Straight",
    6: "Flush", 7: "Full House", 8: "Four of a Kind", 9: "Straight Flush", 10: "Royal Flush"
};

function formatCard(card) {
    let val = card[0] > 10 ? name_face[card[0] - 11] : card[0];
    let suit = name_color[card[1] - 1];
    return `${val} of ${suit}`;
}

function combinations5(cards) {
    let combs = [];
    for (let i = 0; i < cards.length - 4; i++)
        for (let j = i + 1; j < cards.length - 3; j++)
            for (let k = j + 1; k < cards.length - 2; k++)
                for (let l = k + 1; l < cards.length - 1; l++)
                    for (let m = l + 1; m < cards.length; m++)
                        combs.push([cards[i], cards[j], cards[k], cards[l], cards[m]]);
    return combs;
}

function evaluate5(c5) {
    let vals = c5.map(c => c[0]);
    let suits = c5.map(c => c[1]);
    let count = vals.reduce((obj, v) => (obj[v] = (obj[v] || 0) + 1, obj), {});
    let isFlush = new Set(suits).size === 1;
    let uniq = [...new Set(vals)].sort((a, b) => a - b);
    if (uniq.includes(14)) uniq.unshift(1);

    let straightHigh = null;
    for (let i = 0; i + 4 < uniq.length; i++) {
        if (uniq[i + 4] - uniq[i] === 4) {
            straightHigh = uniq[i + 4];
        }
    }

    let groups = Object.entries(count).map(([v, c]) => [c, +v]);
    groups.sort((a, b) => b[0] - a[0] || b[1] - a[1]);

    let rank, tiebreakers;
    if (isFlush && straightHigh) {
        rank = (straightHigh === 14) ? 10 : 9;
        tiebreakers = [straightHigh];
    } else if (groups[0][0] === 4) {
        rank = 8;
        tiebreakers = [groups[0][1], groups[1][1]];
    } else if (groups[0][0] === 3 && groups[1][0] === 2) {
        rank = 7;
        tiebreakers = [groups[0][1], groups[1][1]];
    } else if (isFlush) {
        rank = 6;
        tiebreakers = vals.sort((a, b) => b - a);
    } else if (straightHigh) {
        rank = 5;
        tiebreakers = [straightHigh];
    } else if (groups[0][0] === 3) {
        rank = 4;
        tiebreakers = [groups[0][1], ...vals.filter(v => v !== groups[0][1]).sort((a, b) => b - a)];
    } else if (groups[0][0] === 2 && groups[1][0] === 2) {
        let pairs = [groups[0][1], groups[1][1]].sort((a, b) => b - a);
        let kicker = vals.filter(v => v !== pairs[0] && v !== pairs[1])[0];
        rank = 3;
        tiebreakers = [...pairs, kicker];
    } else if (groups[0][0] === 2) {
        let pair = groups[0][1];
        let kickers = vals.filter(v => v !== pair).sort((a, b) => b - a);
        rank = 2;
        tiebreakers = [pair, ...kickers];
    } else {
        rank = 1;
        tiebreakers = vals.sort((a, b) => b - a);
    }

    return { rank, tiebreakers, cards: c5 };
}

function bestHand(cards7) {
    let best = null;
    for (let combo of combinations5(cards7)) {
        let eval = evaluate5(combo);
        if (!best ||
            eval.rank > best.rank ||
            (eval.rank === best.rank && eval.tiebreakers.some((v, i) => v > best.tiebreakers[i]))
        ) {
            best = eval;
        }
    }
    return best;
}

function compareHands(a, b) {
    if (a.rank !== b.rank) return a.rank - b.rank;
    for (let i = 0; i < a.tiebreakers.length; i++) {
        if (a.tiebreakers[i] !== b.tiebreakers[i]) {
            return a.tiebreakers[i] - b.tiebreakers[i];
        }
    }
    return 0;
}

const deckInit = [];
for (let j = 1; j < 5; j++) {
    for (let i = 2; i < 15; i++) {
        deckInit.push([i, j]);
    }
}

function mainPot() {
	let pot = 0
	players.forEach(p => {
		pot += p.raise
	})
    AfficheRiver()
}

let tourPlaying = true
async function tour() {
	tourPlaying = true
	for (let p of players) {
		if (!(p.state == "all-in" || p.state == "fold")){
        	await p.play();	// attend que le joueur termine son action
		}
	}
	while (tourPlaying){
		tourPlaying = false
		for (let p of players) {
			if (!(p.state == "all-in" || p.state == "fold")){
				if (!(callAmount == p.raise)){
					tourPlaying = true
					await p.play()
			}}
		}
	}
    }

let callAmount = 0
mainPot()

function AfficheRiver(){
	io.on("connection", (socket) => {
  // Ici socket est défini
  socket.emit("display", {
			  cards: community,
			});
});

}

async function nouvellePartie() {
	players = players.filter(p => p.stack !== 0) // supprime les joueurs qui sont à 0
	callAmount = 0
	let deck = [...deckInit];
        community = [];
	let outsiderList = []
	let winnerlist = []
	mainPot()
	
    players.forEach(p=> {
	    p.upadateDisplay()
    })
	AfficheRiver()
    players.forEach(p => {
		p.state = "waiting";
		p.resetHand();
        p.display();
		for (let i = 0; i < 2; i++) {
            let idx = Math.floor(Math.random() * deck.length);
            let card = deck.splice(idx, 1)[0];
            p.receiveCard(card);
		}
		p.updateDisplay();
    });	
	
	for (let i = 0; i < 5; i++) {
        let idx = Math.floor(Math.random() * deck.length);
        community.push(deck.splice(idx, 1)[0]);
    }
	
	await tour();
	AfficheRiver()
	await tour();
	AfficheRiver()
	await tour();
	AfficheRiver()
	await tour();
	
	players.forEach(p => {
		p.best = bestHand([...p.hand, ...community]);
		if (p.state == "waiting" || p.state == "all-in"){
			outsiderList.push(p)
		}
	})
	let indexwinner = null
	while (!(players.every(p => p.raise === 0))) {
		let winner = outsiderList[0];
	    outsiderList.slice(1).forEach(p => {
	        if (compareHands(p.best, winner.best) > 0) {
	            winner = p;
	        }
	    });
		winnerlist.push(winner)
		let winnerpot = 0
		if (winner.state != "all-in") {
			players.forEach(p => {
				if (!winnerlist.includes(p)){
					winnerpot += p.raise
					p.stack += -p.raise
					p.raise = 0
				}
			})
		} else {
			players.forEach(p => {
				if (!winnerlist.includes(p)){
					if (p.raise > winner.raise){
						winnerpot += winner.raise
						p.stack += - winner.raise
						p.raise += - winner.raise
					} else {
						winnerpot += p.raise
						p.stack += -p.raise
						p.raise = 0
					}
				}
			})
		}
		winner.raise = 0
		indexwinner = outsiderList.indexOf(winner);
		outsiderList.splice(indexwinner, 1);
		winner.stack += winnerpot;

	console.log("Mise à jour du texte avec : " + "Winners : " + winnerlist.map(w => w.name).join(", ") + " | Pot : " + winnerpot);
		
	io.on("connection", (socket) => {
 	 // Ici socket est défini
  	socket.emit("afficheInfos", {
		winnerlist: winnerlist,
		winnerpot: winnerpot
			});

}

	// faire tourner les joueurs
	let premier = players.shift();
    players.push(premier);
}
