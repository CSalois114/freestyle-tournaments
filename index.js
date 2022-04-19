let tournament = {
}
let contenders = []

const URL_BASE = 'https://pokeapi.co/api/v2/pokemon/'

document.addEventListener('DOMContentLoaded', async function() {
    
    await generateTournament() // Wait until tournament is generated
    //tournamentResult()
})

const tournamentStructure = () => { // Generate tournament structure
    let roundIndex;
    for (let index  = 0; index < 15; index++) {
        switch(index){
            case 0: case 1:
                roundIndex = 8
                break;
            case 2: case 3:
                roundIndex = 9
                break;
            case 4: case 5:
                roundIndex = 10
                break;
            case 6: case 7:
                roundIndex = 11
                break;
            case 8: case 9:
                roundIndex = 12
                break;
            case 10: case 11:
                roundIndex = 13
                break;
            case 12: case 13:
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
            nextFight: roundIndex
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
        .then((fighter)=> getFigher(fighter))
    }
    
    generateTournamentBracket(contenders)
}

const getFigher = (fighter) => { // Add pokemons to contenders list
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

        // console.log(round)

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
    let result, nextFight, winner
    for (let index = 0; index < 15; index++) {
        result =  Math.floor(Math.random() * 2 )

        nextFight = tournament[`fight${index}`].nextFight

        result == 0 ? winner = tournament[`fight${index}`].home : winner = tournament[`fight${index}`].away
        if(index == 14){
            console.log(`THE WINNER IS: ${winner.species.name}`)
            break;
        }
        
        tournament[`fight${nextFight}`].home == '' ? tournament[`fight${nextFight}`].home = winner : tournament[`fight${nextFight}`].away = winner


        if(tournament[`fight${nextFight}`].home != '' && tournament[`fight${nextFight}`].away != ''){
            tournament[`fight${nextFight}`].status = 'closed'
        }
        
    }
}
