export const getDateStringFromDB = (date) => {
    const d = new Date(date)
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
}

export const getDateFromIGDB = (ts) => {
    const d = new Date(ts*1000)
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
}

export const convertArrayForDB = (arr) => {
    let s = "'{"
    for (let elem of arr) {
        s += `"${elem}",`
    }
    s = s.substring(0,s.length-1)
    s += "}'"
    return s
}

export const mapValuesForInput = (game) => {
    return {...game,
        start_date: game.start_date !== null ? game.start_date : '',
        finish_date: game.finish_date !== null ? game.finish_date : '',
        score: game.score !== null ? game.score : 0
    }
}

export const mapValuesForDB = (game) => {
    return {...game,
        start_date: game.start_date !== '' ? game.start_date : null,
        finish_date: game.finish_date !== '' ? game.finish_date : null,
        score: game.score !== 0 ? game.score : null
    }
}