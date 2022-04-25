let tournament;
const URL_BASE = 'https://pokeapi.co/api/v2/pokemon';

document.addEventListener('DOMContentLoaded', async() => {
    tournament = await getExistingTournament();
    (tournament[0]) ? fillTournamentHTML() : generateTournament();
    addResetFunctionality();
    //tournamentResult()
})

// Generate tournament structure
const newTournamentObject = () => { 
    for (let index  = 0; index < 16; index++) {
        tournament[index] = {
            home: '',
            away: '',
            status: 'open',
            id: index,
            nextId: Math.floor(index / 2) + 8,
            nextTeam: (index & 1) ? 'away' : 'home',
            clickable : true,
        };
    }
}

// Main function: generates tournament structure and gets random pokemon as fighters
const generateTournament = async() => { 
    newTournamentObject()
    const totalPokemon = await fetch(`${URL_BASE}-species/?limit=0`)
    .then(res => res.json())
    .then(data => data.count);
    
    const contenders = [];
    while(contenders.length < 16){
        let id = Math.ceil(Math.random() * totalPokemon);
        if(!contenders.find(contender => contender.id == id)){
            await fetch(`${URL_BASE}/${id}`)
            .then(res => res.json())
            .then(fighter => contenders.push(serializePokemon(fighter)));
        } //look into  simultaneous fetch for all pokemon 
    }
    for (let i = 0; i < contenders.length; i += 2) {
        Object.assign(tournament[i/2], {
            home: contenders[i],
            away: contenders[i + 1],
            status:'closed'
        })
    }
    fillTournamentHTML()
}

// Converts pokemon api object to basic contender object
const serializePokemon = (apiPokemon) => { 
    const statsArray = apiPokemon.stats.map(stat => {
        return {
            name: stat.stat.name,
            value: stat.base_stat
        }
    })  
    return {
        id: apiPokemon.id,
        name: capitalizeString(apiPokemon.species.name),
        img: apiPokemon.sprites.front_default,
        stats: statsArray
    }
}

const capitalizeString = (str) => str.charAt(0).toUpperCase() + str.slice(1)

// Places the contenders in the starting spots
const fillTournamentHTML = () => {
    Object.values(tournament).forEach(round => {
        ['home', 'away'].forEach(team => {
            round[team] && renderContender(round, team)
        });
    });
    saveTournament();
}

// Event listener for picking a winner of a round
const winnerSelected = (e) => {
    const round = tournament[e.target.closest('.round').id.match(/\d+/)[0]]
    if(round.status == 'closed'){
        const winningTeam = e.target.className;
        const nextRound = tournament[round.nextId];

        nextRound[round.nextTeam] = round[winningTeam];
        renderContender(nextRound, round.nextTeam);
        
        document.querySelectorAll(`#round${round.id} img`).forEach(img => {
            img.removeEventListener('click', winnerSelected);
        });
        
        round.clickable = false;
        nextRound.home && nextRound.away && (nextRound.status = 'closed');

        round.nextId == 15 && postNewChamp(round[winningTeam]);
        saveTournament();
    }else{
        alert('Please select opponent before advancing');
    }
}

// Renders a contender on the page
const renderContender = (round, team) => {
    const imgElm = document.querySelector(`#round${round.id} img.${team}`);
    imgElm.src = round[team].img;
    imgElm.style.opacity = 1;

    const nameElm = document.querySelector(`#round${round.id} .name-${team}`);
    nameElm && (nameElm.textContent = round[team].name);
    
    addShowStatsListener(imgElm, round[team].stats);
    round.clickable && imgElm.addEventListener('click', winnerSelected);

    if(round.id == 15) {
        document.getElementById(`round${round.id}`).style.animationPlayState = "running";
    }
}

// add mouseover and mouseout to img that show and hide stats
const addShowStatsListener = (imgElm, stats) => {
    const statsList = document.createElement('ul')
    statsList.classList.add("stats")
    statsList.style.display = 'none'
    imgElm.parentElement.prepend(statsList)

    stats.forEach(stat => {
        const li = document.createElement('li')
        li.textContent = `${stat.name}: ${stat.value}`
        statsList.append(li)
    })
    imgElm.addEventListener('mouseover', () => {
        statsList.style.display = 'block'
    })
    imgElm.addEventListener('mouseout', () => {
        statsList.style.display = 'none'
    })
}

// resets the tournament and gets new contenders when button is clicked
const addResetFunctionality = () => {
    const button = document.getElementById("reset-button")
    button.addEventListener('click', () => {
        tournament = {}
        document.querySelectorAll('.name').forEach(elm => elm.textContent = '')

        document.querySelectorAll('img').forEach(oldImg => {
            const img = oldImg.cloneNode(true)
            oldImg.parentNode.replaceChild(img, oldImg)
            img.style.opacity = 0;
        })
        document.querySelectorAll('.animated').forEach(animatedElm => {
            animatedElm.style.animation = 'none';
            animatedElm.offsetHeight;
            animatedElm.style.animation = null;
        });   
        generateTournament()
    })
}
// CRUD
// Checks if there is an existing tournament
const getExistingTournament = () => { 
    return fetch('http://localhost:3000/tournament')
    .then(res => res.json())
    .then(data => data)
}

// Saves Tournament state
const saveTournament = () => { 
    try{
        fetch('http://localhost:3000/tournament',{
        method: 'PATCH',
        headers:{
            "Accept" : "application/json",
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(tournament)
        })
    }catch(error){
        console.log(error)
    }
}

// Saves a winner of a tournament in the podium
const postNewChamp = (winner) => { 
    let object = {
        name : winner.name
    }
    try{
        fetch('http://localhost:3000/podium',{
            method: 'POST',
            headers: {
                "Accept" : "application/json",
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(object)
    
        })
    }catch(error){
        console.log(winner)
    }
}

//Test
/*
const tournamentResult = () => { // Randomizes the results of each fight and gives a final result
    let result, next, winner, round, image, name
    for (let index = 0; index < 15; index++) {
        result =  Math.floor(Math.random() * 2 )

        next = tournament[index].nextId

        result == 0 ? winner = tournament[`fight${index}`].home : winner = tournament[`fight${index}`].away
        if(index == 14){
            console.log(`THE WINNER IS: ${winner.name}`)

            winnerSpot = document.getElementById('winner')

            winnerSpot.getElementsByTagName('img')[0].src= winner.img;
            winnerSpot.getElementsByTagName('h2')[0].textContent = winner.name
            break;
        }

        round = document.getElementById(`${next}`)
        

        if(tournament[`fight${next}`].home == ''){
            tournament[`fight${next}`].home = winner

            if(next == 14){
                round = document.getElementById('home-finals')
                name = round.getElementsByTagName('h3')
                name[0].textContent = winner.name
                image = round.getElementsByTagName('img')
                image[0].src = winner.img
            }else{
                image = round.getElementsByTagName('img')
                image[0].src = winner.img
                image[0].id = winner.id
            }
        }else{
            tournament[`fight${next}`].away = winner

            if(next == 14){
                round = document.getElementById('away-finals')
                name = round.getElementsByTagName('h3')
                name[0].textContent = winner.name
                image = round.getElementsByTagName('img')
                image[0].src = winner.img
            }else{
                image = round.getElementsByTagName('img')
                image[1].src = winner.img
                image[1].id = winner.id
            }
        }

        if(tournament[next].home != '' && tournament[next].away != ''){
            tournament[next].status = 'closed'
        }
        
    }
}
*/