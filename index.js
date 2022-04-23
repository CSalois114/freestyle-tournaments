let tournament = {}

const defaultImg = 'https://pic.onlinewebfonts.com/svg/img_30754.png'
const URL_BASE = 'https://pokeapi.co/api/v2/pokemon'

document.addEventListener('DOMContentLoaded', async() => {
    await checkExistingTournament();
    (tournament[0]) ? fillTournamentHTML() : generateTournament();
    addResetFunctionality()
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
        }
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

// converts pokemon api object to basic contender object
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

//places the contenders in the starting spots
const fillTournamentHTML = () => {
    for (let index = 0; index < 16; index++) {
        const round = tournament[index];
        const roundDiv = document.getElementById(`round${index}`);
        ['home', 'away'].forEach(team => {
            if(round[team]) {
                const name = roundDiv.querySelector(`.name-${team}`);
                name && (name.textContent = round[team].name);
                const img = roundDiv.querySelector(`img.${team}`);
                img.src = round[team].img;
                img.style.opacity = 1;
                addShowStatsListener(img, round[team].stats);
                round.clickable && img.addEventListener('click', winnerSelected);
                if(index == 15) {
                    document.getElementById('winner').style.animationPlayState = "running"
                }
            }
        })
    }  
    saveTournament()
}

// const renderContender = (round)

const winnerSelected = (e) => {
    const roundNumber = e.target.parentNode.parentNode.id.match(/\d+/)[0]
    const round = tournament[roundNumber]
    const nextRound = tournament[round.nextId]
    if(round.status == 'closed'){
        const winner = (round.home.img == e.target.src ?  "home" : "away");

        const img = document.querySelector(`#round${round.nextId} .${round.nextTeam}`);
        img.src = round[winner].img;
        img.style.opacity = 1;
        img.addEventListener('click', winnerSelected);
        addShowStatsListener(img, round[winner].stats);
        e.target.closest('.pair').querySelectorAll('img').forEach(img => {
            img.removeEventListener('click', winnerSelected);
        });

        if(round.nextId >= 14){
            img.closest(`.pair`).querySelector(`.name-${round.nextTeam}`)
            .textContent = round[winner].name;
        } 

        nextRound[round.nextTeam] = round[winner];
        nextRound.home && nextRound.away && (nextRound.status = 'closed');
        round.clickable = false;
        if(round.nextId == 15) {
            postNewChamp(round[winner]);
            document.getElementById('winner').style.animationPlayState = "running"
        }
        saveTournament();
    }else{
        alert('Please select opponent before advancing');
    }
}

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

const addResetFunctionality = () => {
    const button = document.getElementById("reset-button")
    button.addEventListener('click', () => {
        tournament = {}
        document.getElementsByTagName('h2')[1].textContent = ''
        document.querySelectorAll('h3').forEach(elm => elm.textContent = '')

        let images = document.getElementsByTagName('img')
        for (const oldImg of images) {
            const img = oldImg.cloneNode(true)
            oldImg.parentNode.replaceChild(img, oldImg)
            img.src = defaultImg
            img.style.opacity = 0;
        }

        const animatedElm = document.getElementById('winner');
        animatedElm.style.animation = 'none';
        animatedElm.offsetHeight;
        animatedElm.style.animation = null;

        generateTournament()
    })
}

// CRUD

const checkExistingTournament = () => { // Checks if there is an existing tournament
    return fetch('http://localhost:3000/tournament')
    .then((res)=>res.json())
    .then((data)=> tournament = data)
}

const saveTournament = () => { // Saves Tournament state
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

const postNewChamp = (winner) => { // Saves a winner of a tournament in the podium
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

        next = tournament[`fight${index}`].nextId

        result == 0 ? winner = tournament[`fight${index}`].home : winner = tournament[`fight${index}`].away
        if(index == 14){
            console.log(`THE WINNER IS: ${winner.name}`)

            winnerSpot = document.getElementById('winner')

            winnerSpot.getElementsByTagName('img')[0].src= winner.img;
            winnerSpot.getElementsByTagName('h2')[0].textContent = winner.name
            break;
        }

        round = document.getElementById(`round${next}`)
        

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

        if(tournament[`fight${next}`].home != '' && tournament[`fight${next}`].away != ''){
            tournament[`fight${next}`].status = 'closed'
        }
        
    }
}
*/