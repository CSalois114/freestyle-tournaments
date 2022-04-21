let tournament = {}
let contenders = []

let dbSize = 300 //temp, need real size
const defaultImg = 'https://pic.onlinewebfonts.com/svg/img_30754.png'

const URL_BASE = 'https://pokeapi.co/api/v2/pokemon/'

document.addEventListener('DOMContentLoaded', async() => {
    await checkExistingTournament()
    
    if(tournament.hasOwnProperty('fight1')) {
        retrieveContenders()
        uploadSavedTournament()   
    } else {
        generateTournament()
    }
    
    addResetFunctionality()
    //tournamentResult()
})

// Generate tournament structure
const tournamentStructure = () => { 
    let roundIndex, fightingFor;
    for (let index  = 0; index < 15; index++) {
        switch(index){
            case 0: 
                roundIndex = 8    
                fightingFor = 'home'  
                break
            case 1:
                roundIndex = 8
                fightingFor = 'away'
                break;
            case 2: 
                roundIndex = 9
                fightingFor = 'home'
                break;
            case 3:
                roundIndex = 9
                fightingFor = 'away'
                break;
            case 4: 
                roundIndex = 10
                fightingFor = 'home'
                break;
            case 5:
                roundIndex = 10
                fightingFor = 'away'
                break;
            case 6: 
                roundIndex = 11
                fightingFor = 'home'
                break;
            case 7:
                roundIndex = 11
                fightingFor = 'away'
                break;
            case 8:
                roundIndex = 12
                fightingFor = 'home'
                break;
            case 9:
                roundIndex = 12
                fightingFor = 'away'
                break;
            case 10: 
                roundIndex = 13
                fightingFor = 'home'
                break;
            case 11:
                roundIndex = 13
                fightingFor = 'away'
                break;
            case 12: 
                fightingFor = 'home'
                roundIndex = 14
                break;
            case 13:
                fightingFor = 'away'
                roundIndex = 14
                break;
            default:
                roundIndex = -1
                break;    
        }
        tournament[`fight${index}`]= {
            home: '',
            away: '',
            status: 'open',
            nextFight: roundIndex,
            placement: fightingFor,
            clickable : true,
        }
    }
}

// Main function: generates tournament structure and gets random pokemon as fighters
const generateTournament = async() => { 
     tournamentStructure()

    while(contenders.length < 16){
        let id = Math.ceil(Math.random() * dbSize)
        if(!contenders.find(contender => contender.id == id)){
            await fetch(`${URL_BASE}${id}`)
            .then(res => res.json())
            .then(fighter => contenders.push(serializePokemon(fighter)))
        }
    } 
    saveContenders()
    generateTournamentBracket(contenders)
}

// converts pokemon api object to basic contender object
const serializePokemon = (apiPokemon) => {

    return {
        id: apiPokemon.id,
        name: capitalizeString(apiPokemon.species.name),
        img: apiPokemon.sprites.front_default,
        stats: apiPokemon.stats
    }
}

const capitalizeString = (str) => str.charAt(0).toUpperCase() + str.slice(1)

// Generates the tournament bracket and fills the object tournament
const generateTournamentBracket = (contenders) => {  
    for (let i = 0; i < contenders.length; i += 2) {
        Object.assign(tournament[`fight${i/2}`], {
            home: contenders[i],
            away: contenders[i + 1],
            status:'closed'
        })
    }
    fillTournamentHTML()
}

const fillTournamentHTML = () => {
    for (let index = 0; index < 8; index++) {
        let round = tournament[`fight${index}`]
        let roundHTML = document.getElementById(`round${index}`)
        let names = roundHTML.getElementsByClassName('name')
        let images = roundHTML.getElementsByTagName('img')

        //home contender
        names[0].textContent = round.home.name
        images[0].src = round.home.img
        images[0].id = round.home.id
        addShowStatsListener(images[0], round.home.stats)

        //Away contender
        names[1].textContent = round.away.name
        images[1].src = round.away.img
        images[1].id = round.away.id
        addShowStatsListener(images[1], round.away.stats)
        
        for (const oneImage of images) {
            oneImage.addEventListener('click', winnerSelected)
        }
    }
    
    saveTournament()
}

const uploadSavedTournament = () => {
    let name
    for (let index = 0; index < 15; index++) {
        round = tournament[`fight${index}`]
        if(index == 14){
            if(round.home != ''){
                roundHTML = document.getElementById('left-finals')
                name = roundHTML.getElementsByTagName('h3')
                name[0].textContent = round.home.name
                image = roundHTML.getElementsByTagName('img')
                image[0].src = round.home.img
                image[0].id = round.home.id
                image[0].addEventListener('click', finalWinner)
                addShowStatsListener(image[0], round.home.stats)
            }

            if(round.away != ''){
                roundHTML = document.getElementById('right-finals')
                name = roundHTML.getElementsByTagName('h3')
                name[0].textContent = round.away.name
                image = roundHTML.getElementsByTagName('img')
                image[0].src = round.away.img
                image[0].id = round.away.id
                image[0].addEventListener('click', finalWinner)
                addShowStatsListener(image[0], round.away.stats)
            }
        }else{
            roundHTML = document.getElementById(`round${index}`)
            images = roundHTML.getElementsByTagName('img')
            switch(index){
                case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                    names = roundHTML.getElementsByClassName('name')
                    names[0].textContent = round.home.name
                    names[1].textContent = round.away.name
                    break;
            }

            if(round.home != ''){
                //home contender
                images[0].src = round.home.img
                images[0].id = round.home.id
                addShowStatsListener(images[0], round.home.stats)
            }
            if(round.away != ''){
                //Away contender
                images[1].src = round.away.img
                images[1].id = round.away.id
                addShowStatsListener(images[1], round.away.stats)
            }
            if(round.clickable){
                for (const oneImage of images) {
                    oneImage.addEventListener('click', winnerSelected)
                }
            }
        }

    } 
}

const winnerSelected = (event) => {
    let winner, name, image;
    let selected = event.target.id

    let round = event.target.parentNode.parentNode.id.match(/\d+/)[0]
    let nextFight = tournament[`fight${round}`].nextFight

    if(tournament[`fight${round}`].status == 'closed'){

        tournament[`fight${round}`].home.id == selected ? winner = tournament[`fight${round}`].home : winner = tournament[`fight${round}`].away
        roundHTML = document.getElementById(`round${nextFight}`)
        
        if(tournament[`fight${round}`].placement == 'home'){
            tournament[`fight${nextFight}`].home = winner

            if(nextFight == 14){
                roundHTML = document.getElementById('left-finals')
                name = roundHTML.getElementsByTagName('h3')
                name[0].textContent = winner.name
                image = roundHTML.getElementsByTagName('img')
                image[0].src = winner.img
                image[0].id = winner.id
                image[0].addEventListener('click', finalWinner)
                addShowStatsListener(image[0], winner.stats)
            }else{
                image = roundHTML.getElementsByTagName('img')
                image[0].src = winner.img
                image[0].id = winner.id
                image[0].addEventListener('click', winnerSelected)
                addShowStatsListener(image[0], winner.stats)
            }
        }else{
            tournament[`fight${nextFight}`].away = winner

            if(nextFight == 14){
                roundHTML = document.getElementById('right-finals')
                name = roundHTML.getElementsByTagName('h3')
                name[0].textContent = winner.name
                image = roundHTML.getElementsByTagName('img')
                image[0].src = winner.img
                image[0].id = winner.id
                image[0].addEventListener('click', finalWinner)
                addShowStatsListener(image[0], winner.stats)
            }else{
                image = roundHTML.getElementsByTagName('img')
                image[1].src = winner.img
                image[1].id = winner.id
                image[1].addEventListener('click', winnerSelected)
                addShowStatsListener(image[1], winner.stats)
            }
        }

        if(tournament[`fight${nextFight}`].home != '' && tournament[`fight${nextFight}`].away != ''){
            tournament[`fight${nextFight}`].status = 'closed'
        }

        let images = event.target.parentNode.parentNode.getElementsByTagName('img')
        for (const oneImage of images) {
            oneImage.removeEventListener('click', winnerSelected)
        }
        tournament[`fight${round}`].clickable = false
        //console.log(tournament)
        saveTournament()
    }else{
        alert('Please select opponent before advancing')
    }

}

const finalWinner = (event) =>{
    let winner;
    let selected = event.target.id
    if(tournament['fight14'].status == 'closed'){

        tournament[`fight14`].home.id == selected ? winner = tournament[`fight14`].home : winner = tournament[`fight14`].away
        winnerSpot = document.getElementById('winner')

        winnerSpot.getElementsByTagName('img')[0].src= winner.img;
        winnerSpot.getElementsByTagName('h2')[1].textContent = winner.name
        
        document.getElementById('right-finals').getElementsByTagName('img')[0].removeEventListener('click', finalWinner)
        document.getElementById('left-finals').getElementsByTagName('img')[0].removeEventListener('click', finalWinner)

        postNewChamp(winner)
    }else{
        alert('Please select opponent before advancing')
    }
}

const addShowStatsListener = (imgElm, stats) => {
    const statsList = document.createElement('ul')
    statsList.classList.add("stats")
    statsList.style.display = 'none'
    imgElm.parentElement.append(statsList)

    stats.forEach(stat => {
        const li = document.createElement('li')
        li.textContent = `${stat.stat.name}: ${stat.base_stat}`
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
        contenders = []
        document.getElementsByTagName('h2')[1].textContent = ''
        document.querySelectorAll('h3').forEach(elm => elm.textContent = '')

        let images = document.getElementsByTagName('img')
        for (const oldImg of images) {
            const img = oldImg.cloneNode(true)
            oldImg.parentNode.replaceChild(img, oldImg)
            img.src = defaultImg
        }

        generateTournament()
    })
}

//Test
/*
const tournamentResult = () => { // Randomizes the results of each fight and gives a final result
    let result, nextFight, winner, round, image, name
    for (let index = 0; index < 15; index++) {
        result =  Math.floor(Math.random() * 2 )

        nextFight = tournament[`fight${index}`].nextFight

        result == 0 ? winner = tournament[`fight${index}`].home : winner = tournament[`fight${index}`].away
        if(index == 14){
            console.log(`THE WINNER IS: ${winner.name}`)

            winnerSpot = document.getElementById('winner')

            winnerSpot.getElementsByTagName('img')[0].src= winner.img;
            winnerSpot.getElementsByTagName('h2')[0].textContent = winner.name
            break;
        }

        round = document.getElementById(`round${nextFight}`)
        

        if(tournament[`fight${nextFight}`].home == ''){
            tournament[`fight${nextFight}`].home = winner

            if(nextFight == 14){
                round = document.getElementById('left-finals')
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
            tournament[`fight${nextFight}`].away = winner

            if(nextFight == 14){
                round = document.getElementById('right-finals')
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

        if(tournament[`fight${nextFight}`].home != '' && tournament[`fight${nextFight}`].away != ''){
            tournament[`fight${nextFight}`].status = 'closed'
        }
        
    }
}
*/

// CRUD

const checkExistingTournament = () => { // Checks if there is an existing tournament
    return fetch('http://localhost:3000/tournament')
    .then((res)=>res.json())
    .then((data)=> tournament = data)
}

const retrieveContenders = () => { // Retrieves contenders if a tournament exists
    fetch('http://localhost:3000/contenders')
    .then((res)=>res.json())
    .then((data)=> contenders = data)
}

const saveContenders = () => {  // Saves contenders
    try{
        fetch('http://localhost:3000/contenders',{
        method: 'PATCH',
        headers:{
            "Accept" : "application/json",
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(contenders)
        })
    }catch(error){
        console.log(error)
    }
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