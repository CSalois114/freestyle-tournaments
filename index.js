let tournament = {
}
let contenders = []

const URL_BASE = 'https://pokeapi.co/api/v2/pokemon/'

document.addEventListener('DOMContentLoaded', async function() {
    
    await generateTournament() // Wait until tournament is generated
    tournamentResult()
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
    let id, random=[], valid = false
    for (let index = 0; index < 16; index++) {
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
    let counter = 0;
    for (let index = 0; index < contenders.length; index=index+2) {
        tournament[`fight${counter}`].home = contenders[index].species.name
        tournament[`fight${counter}`].away = contenders[index+1].species.name
        tournament[`fight${counter}`].status = 'closed'
        counter++;
    }

}

const tournamentResult = () => { // Randomizes the results of each fight and gives a final result
    let result, nextFight, winner
    for (let index = 0; index < 15; index++) {
        result =  Math.floor(Math.random() * 2 )

        nextFight = tournament[`fight${index}`].nextFight

        result == 0 ? winner = tournament[`fight${index}`].home : winner = tournament[`fight${index}`].away
        if(index == 14){
            console.log(`THE WINNER IS: ${winner}`)
            break;
        }
        tournament[`fight${nextFight}`].home == '' ? tournament[`fight${nextFight}`].home = winner : tournament[`fight${nextFight}`].away = winner

        if(tournament[`fight${nextFight}`].home != '' && tournament[`fight${nextFight}`].away != ''){
            tournament[`fight${nextFight}`].status = 'closed'
        }
        
    }
    console.log(tournament)
}
