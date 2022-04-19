let tournament = {
}
let contenders = []

const URL_BASE = 'https://pokeapi.co/api/v2/pokemon/'

document.addEventListener('DOMContentLoaded', async function() {
    
    await generateTournament() // Wait until tournament is generated
    
    //tournamentResult()
})

const tournamentStructure = () => { // Generate tournament structure
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
            placement: fightingFor
        }
    }
}

const generateTournament = async() => { // Main function: generates tournament structure and gets random pokemons as fighters
    
    tournamentStructure()

    let id, random=[], valid;
    for (let index = 0; index < 16; index++) {
        valid= false;
        do{
            id = Math.floor(Math.random() * 300 + 1)
            if(!random.includes(id)){
                random.push(id)
                valid = true
            }
        }while(!valid)
        

        await fetch(`${URL_BASE}${id}`)
        .then((res)=> res.json())
        .then((fighter)=> {
            const name =fighter.species.name
            fighter.species.name = name.charAt(0).toUpperCase() + name.slice(1)
            getFighter(fighter)
        })
    }
    
    generateTournamentBracket(contenders)
}

const getFighter = (fighter) => { // Add pokemons to contenders list
    contenders.push(fighter)
}

const generateTournamentBracket = (contenders) => {  // Generates the tournament bracket and fills the object tournament
    let round = 0;
    for (let index = 0; index < contenders.length; index=index+2) {
        tournament[`fight${round}`].home = contenders[index]
        tournament[`fight${round}`].away = contenders[index+1]
        tournament[`fight${round}`].status = 'closed'
        round++;
    }
    fillTournamentHTML()
}

const fillTournamentHTML = () => {
    let round, roundHTML, names, images;
    for (let index = 0; index < 8; index++) {
        round = tournament[`fight${index}`]
        roundHTML = document.getElementById(`round${index}`)
        names = roundHTML.getElementsByClassName('name')
        images = roundHTML.getElementsByTagName('img')

        //home contender
        names[0].textContent = round.home.species.name
        images[0].src = round.home.sprites.front_default
        images[0].id = round.home.id
        addShowStatsListener(images[0], round.home.stats)

        //Away contender
        names[1].textContent = round.away.species.name
        images[1].src = round.away.sprites.front_default
        images[1].id = round.away.id
        addShowStatsListener(images[1], round.away.stats)
        
        for (const oneimage of images) {
            oneimage.addEventListener('click', winnerSelected)
        }

    }

    console.log(tournament)
}

const winnerSelected = (event) => {
    let winner, name, image;
    let selected = event.target.id

    let round = event.target.parentNode.parentNode.id.match(/\d+/)[0]
    let nextFight = tournament[`fight${round}`].nextFight

    console.log(round)



    if(tournament[`fight${round}`].status == 'closed'){

        tournament[`fight${round}`].home.id == selected ? winner = tournament[`fight${round}`].home : winner = tournament[`fight${round}`].away
        roundHTML = document.getElementById(`round${nextFight}`)
        
        if(tournament[`fight${round}`].placement == 'home'){
            tournament[`fight${nextFight}`].home = winner

            if(nextFight == 14){
                roundHTML = document.getElementById('home-finals')
                name = roundHTML.getElementsByTagName('h3')
                name[0].textContent = winner.species.name
                image = roundHTML.getElementsByTagName('img')
                image[0].src = winner.sprites.front_default
                image[0].id = winner.id
                image[0].addEventListener('click', finalWinner)
            }else{
                image = roundHTML.getElementsByTagName('img')
                image[0].src = winner.sprites.front_default
                image[0].id = winner.id
                image[0].addEventListener('click', winnerSelected)
            }
        }else{
            tournament[`fight${nextFight}`].away = winner

            if(nextFight == 14){
                roundHTML = document.getElementById('away-finals')
                name = roundHTML.getElementsByTagName('h3')
                name[0].textContent = winner.species.name
                image = roundHTML.getElementsByTagName('img')
                image[0].src = winner.sprites.front_default
                image[0].id = winner.id
                image[0].addEventListener('click', finalWinner)
            }else{
                image = roundHTML.getElementsByTagName('img')
                image[1].src = winner.sprites.front_default
                image[1].id = winner.id
                image[1].addEventListener('click', winnerSelected)
            }
        }

        if(tournament[`fight${nextFight}`].home != '' && tournament[`fight${nextFight}`].away != ''){
            tournament[`fight${nextFight}`].status = 'closed'
        }

        let images = event.target.parentNode.parentNode.getElementsByTagName('img')
        for (const oneImage of images) {
            oneImage.removeEventListener('click', winnerSelected)
        }
    }else{
        alert('Please select opponent before advancing')
    }

}

const finalWinner = (event) =>{
    let winner;
    let selected = event.target.id
    console.log(event.target)
    if(tournament['fight14'].status == 'closed'){

        tournament[`fight14`].home.id == selected ? winner = tournament[`fight14`].home : winner = tournament[`fight14`].away
        winnerSpot = document.getElementById('winner')

        winnerSpot.getElementsByTagName('img')[0].src= winner.sprites.front_default;
        winnerSpot.getElementsByTagName('h2')[1].textContent = winner.species.name
    }else{
        alert('Please select opponent before advancing')
    }
}

const addShowStatsListener = (imgElm, stats) => {
    const statsList = document.createElement('ul')
    statsList.classList.add("stats")
    stats.forEach(stat => {
        const li = document.createElement('li')
        li.textContent = `${stat.stat.name}: ${stat.base_stat}`
        statsList.append(li)
    })
    statsList.style.display = 'none'
    imgElm.parentElement.append(statsList)

    imgElm.addEventListener('mouseover', () => {
        statsList.style.display = 'block'
    })
    imgElm.addEventListener('mouseout', () => {
        statsList.style.display = 'none'
    })
}

const tournamentResult = () => { // Randomizes the results of each fight and gives a final result
    let result, nextFight, winner, round, image, name
    for (let index = 0; index < 15; index++) {
        result =  Math.floor(Math.random() * 2 )

        nextFight = tournament[`fight${index}`].nextFight

        result == 0 ? winner = tournament[`fight${index}`].home : winner = tournament[`fight${index}`].away
        if(index == 14){
            console.log(`THE WINNER IS: ${winner.species.name}`)

            winnerSpot = document.getElementById('winner')

            winnerSpot.getElementsByTagName('img')[0].src= winner.sprites.front_default;
            winnerSpot.getElementsByTagName('h2')[0].textContent = winner.species.name
            break;
        }

        round = document.getElementById(`round${nextFight}`)
        

        if(tournament[`fight${nextFight}`].home == ''){
            tournament[`fight${nextFight}`].home = winner

            if(nextFight == 14){
                round = document.getElementById('home-finals')
                name = round.getElementsByTagName('h3')
                name[0].textContent = winner.species.name
                image = round.getElementsByTagName('img')
                image[0].src = winner.sprites.front_default
            }else{
                image = round.getElementsByTagName('img')
                image[0].src = winner.sprites.front_default
                image[0].id = winner.id
            }
        }else{
            tournament[`fight${nextFight}`].away = winner

            if(nextFight == 14){
                round = document.getElementById('away-finals')
                name = round.getElementsByTagName('h3')
                name[0].textContent = winner.species.name
                image = round.getElementsByTagName('img')
                image[0].src = winner.sprites.front_default
            }else{
                image = round.getElementsByTagName('img')
                image[1].src = winner.sprites.front_default
                image[1].id = winner.id
            }
        }

        if(tournament[`fight${nextFight}`].home != '' && tournament[`fight${nextFight}`].away != ''){
            tournament[`fight${nextFight}`].status = 'closed'
        }
        
    }
}
