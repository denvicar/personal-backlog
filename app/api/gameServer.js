'use server'
import {promises as fs} from 'fs'
import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
import {convertArrayForDB} from "@/app/utils/utils";
import {revalidatePath} from "next/cache";

const base_url = 'https://api.igdb.com/v4'
const headers = {
    'Client-ID': process.env.IGDB_CLIENT_ID,
    'Authorization': `Bearer ${process.env.IGDB_TOKEN}`
}
const requested_fields = 'fields id,aggregated_rating,cover.url,first_release_date,genres.name,name,platforms.name,summary'

const formatDbData = (json) => {
    return json.map(item => {
        let mapped = {}
        for (let key in item) {
            mapped[key.toLowerCase()] = item[key]
        }

        if ('rating' in mapped && mapped.rating) {
            mapped.rating /= 100
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
    return res.json()
}

export async function getGames() {
    const {rows} = await sql`select * from "Games" order by id asc`
    revalidatePath('/')
    return formatDbData(rows)
}

export async function addGame(game) {
    let res = await sql`INSERT INTO "Games"(title, igdb_id, cover_url, score, rating, summary, comments, genres, platforms, release_date, start_date, finish_date, status)
                VALUES (${game.title}, ${game.igdb_id}, ${game.cover_url}, ${game.score}, ${game.rating}, ${game.summary}, ${game.comments}, ${game.genres}, ${game.platforms}, ${game.release_date}, ${game.start_date}, ${game.finish_date}, ${game.status});`
    console.log(res)
    return getGames()
}

export async function updateGame(game) {
    const res = await sql`UPDATE "Games"
                SET score=${game.score}, comments=${game.comments}, start_date=${game.start_date}, finish_date=${game.finish_date}, status=${game.status}
                WHERE id=${game.id};`
    console.log(res)
    return getGames()
}

export async function deleteGame(id) {
    const res = await sql`Delete from "Games" where id=${id}`
    console.log(res)
    return getGames()
}