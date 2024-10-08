'use server'
import {sql} from "@vercel/postgres";
import {unstable_noStore} from "next/cache";
import { HltbService } from "../lib/hltb/hltbService";

const base_url = 'https://api.igdb.com/v4'
const auth_url = 'https://id.twitch.tv/oauth2/token?'

let access_token = process.env.IGDB_TOKEN
let headers = {
    'Client-ID': process.env.IGDB_CLIENT_ID,
    'Authorization': `Bearer ${process.env.IGDB_TOKEN}`
}

const authenticate = async () => {
    const params = new URLSearchParams({
        client_id: process.env.IGDB_CLIENT_ID,
        client_secret: process.env.IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials'
    })
    const res = await fetch(auth_url + params, {method: 'POST'})
    let data = await res.json();
    access_token = data.access_token
    headers = {...headers, 'Authorization': `Bearer ${access_token}`}
}

const requested_fields = 'fields id,aggregated_rating,cover.url,first_release_date,genres.name,name,platforms.name,summary'
const hltbService = new HltbService()
const formatDbData = (json) => {
    return json.map(item => {
        let mapped = {}
        for (let key in item) {
            mapped[key.toLowerCase()] = item[key]
        }

        if ('rating' in mapped && mapped.rating) {
            mapped.rating /= 100
        }

        if ('time_to_beat' in mapped && mapped.time_to_beat) {
            mapped.time_to_beat = mapped.time_to_beat.map(ttb => ttb/100)
        }

        if ('genres' in mapped && mapped.genres) {
            let newGenres = []
            for (let genre of mapped.genres) {
                if (genre.startsWith("'")) {
                    newGenres.push(genre.substring(1,genre.length-1))
                }
                else newGenres.push(genre)
            }
            mapped.genres = newGenres
        }

        if ('platforms' in mapped && mapped.platforms) {
            let newPlatforms = []
            for (let platform of mapped.platforms) {
                if (platform.startsWith("'")) {
                    newPlatforms.push(platform.substring(1,platform.length-1))
                } else newPlatforms.push(platform)
            }
            mapped.platforms = newPlatforms
        }

        if ('release_date' in mapped && mapped.release_date) {
            let d = new Date(mapped.release_date)
            mapped.release_date = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
        }
        if ('start_date' in mapped && mapped.start_date) {
            let d = new Date(mapped.start_date)
            mapped.start_date = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
        }
        if ('finish_date' in mapped && mapped.finish_date) {
            let d = new Date(mapped.finish_date)
            mapped.finish_date = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
        }

        return mapped
    })
}
export async function searchGame(game) {
    const res = await fetch(`${base_url}/games`, {
        method: 'POST',
        headers: headers,
        body: `${requested_fields}; search "${game}";`
    })
    let data = await res.json();
    if (data.message && data.message.startsWith('Authorization')) {
        await authenticate()
        return searchGame(game)
    }

    return data;
}

export async function insertGame(game) {
    try {
        unstable_noStore()
        await sql`INSERT INTO "Games"(title, igdb_id, cover_url, score, rating, summary, comments, genres, platforms, release_date, start_date, finish_date, status, "user", time_to_beat)
                VALUES (${game.title}, ${game.igdb_id}, ${game.cover_url}, ${game.score}, ${game.rating}, ${game.summary}, ${game.comments}, 
                ${game.genres}, ${game.platforms}, ${game.release_date}, ${game.start_date}, ${game.finish_date}, ${game.status}, ${game.user},
                ${game.time_to_beat});`

        const res = await sql`select * from "Games" where igdb_id=${game.igdb_id}`
        return formatDbData(res.rows)[0]
    } catch (error) {
        return {status: 500, message: 'Database error'}
    }
}

export async function getGames(user) {
    unstable_noStore()
    const {rows} = await sql`select * from "Games" where "user"=${user} order by id asc`
    return formatDbData(rows)
}

export async function addGame(game) {
    return hltbService.search(game.title)
        .then(htlbEntry => {
            console.log(htlbEntry)
            game.time_to_beat = [htlbEntry[0].gameplayMain, htlbEntry[0].gameplayMainExtra, htlbEntry[0].gameplayCompletionist].map(t => Math.round(t * 100))
            return insertGame(game)
        }).catch(async (e) => {
            console.log(e)
            game.time_to_beat = []
            return insertGame(game)
        })
}

export async function updateGame(game) {
    try {
        await sql`UPDATE "Games"
                SET score=${game.score}, comments=${game.comments}, start_date=${game.start_date}, finish_date=${game.finish_date}, status=${game.status}
                WHERE id=${game.id};`
        return {status:200,message:'Updated game'}
    } catch (error) {
        return {status:500,message:'Database error'}
    }

}

export async function deleteGame(id) {
    try {
        await sql`Delete from "Games" where id=${id}`
        return {status:200,message:'Deleted game'}
    } catch (error) {
        return {status:500,message:'Database error'}
    }

}