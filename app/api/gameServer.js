'use server'
import {promises as fs} from 'fs'
const base_url = 'https://api.igdb.com/v4'
const headers = {
    'Client-ID': process.env.IGDB_CLIENT_ID,
    'Authorization': `Bearer ${process.env.IGDB_TOKEN}`
}
const requested_fields = 'fields id,aggregated_rating,cover.url,first_release_date,genres.name,name,platforms.name,summary'
export async function searchGame(game) {
    const res = await fetch(`${base_url}/games`, {
        method: 'POST',
        headers: headers,
        body: `${requested_fields}; search "${game}";`
    })
    return res.json()
}

export async function addGame(game) {
    let db = await fs.readFile(process.cwd()+'/app/db.json', 'utf8')
    let jsonDb = JSON.parse(db)
    jsonDb = [...jsonDb, {...game,user:"Ciro"}]
    await fs.writeFile(process.cwd()+"/app/db.json", JSON.stringify(jsonDb), 'utf8')
    return jsonDb[jsonDb.length-1]
}

export async function updateGame(game) {
    let db = await fs.readFile(process.cwd()+'/app/db.json', 'utf8')
    let jsonDb = JSON.parse(db)
    jsonDb = jsonDb.map(g => g.id===game.id ? game : g)
    await fs.writeFile(process.cwd()+"/app/db.json", JSON.stringify(jsonDb), 'utf8')
    return game
}

export async function deleteGame(id) {
    let db = await fs.readFile(process.cwd()+'/app/db.json', 'utf8')
    let jsonDb = JSON.parse(db)
    jsonDb = jsonDb.filter(g => g.id!==id)
    await fs.writeFile(process.cwd()+"/app/db.json", JSON.stringify(jsonDb), 'utf8')
    return jsonDb
}