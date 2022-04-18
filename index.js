let tournament = {
}
let contenders = []

const URL_BASE = 'https://pokeapi.co/api/v2/pokemon/'

document.addEventListener('DOMContentLoaded', function() {
    generateContenders()
})

const generateContenders = async() => {
    for (let index = 0; index < 16; index++) {
        let id = Math.floor(Math.random() * 300)
        await fetch(`${URL_BASE}${id}`)
        .then((res)=> res.json())
        .then((fighter)=> getFigher(fighter))
    }

    generateTournamentBracket(contenders)
}

const getFigher = (fighter) => {
    contenders.push(fighter)
}

const generateTournamentBracket = (contenders) => {
    
    for (let index  = 0; index < 15; index++) {
        tournament[`fight${index}`]= {
            home: '',
            away: ''
        }
    }

    let counter = 0;
    for (let index = 0; index < contenders.length; index=index+2) {
        tournament[`fight${counter}`].home = contenders[index].species.name
        tournament[`fight${counter}`].away = contenders[index+1].species.name
        counter++;
    }

    console.log(tournament)
}
