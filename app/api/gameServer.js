'use server'
import {sql} from "@vercel/postgres";
import {unstable_noStore} from "next/cache";
import { HltbService } from "../lib/hltb/hltbService";
import {mapValuesForDB} from "@/app/utils/utils";

const base_url = 'https://api.igdb.com/v4'
const auth_url = 'https://id.twitch.tv/oauth2/token?'
const baseGameCategories = new Set([0, 8, 9, 10, 11])

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

const requested_fields = 'fields id,aggregated_rating,category,cover.url,first_release_date,genres.name,name,parent_game,platforms.name,summary,version_parent'
const hltbService = new HltbService()

const normalizeSearchTerm = (value) => {
    if (!value) return ''
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
}

const escapeIgdbSearchString = (value) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

const rankSearchResult = (result, query) => {
    const normalizedQuery = normalizeSearchTerm(query)
    const normalizedName = normalizeSearchTerm(result?.name)
    const queryTerms = normalizedQuery.split(' ').filter(Boolean)
    const exactMatch = normalizedName === normalizedQuery
    const startsWithQuery = normalizedName.startsWith(normalizedQuery)
    const containsQuery = normalizedQuery !== '' && normalizedName.includes(normalizedQuery)
    const containsAllTerms = queryTerms.length > 0 && queryTerms.every((term) => normalizedName.includes(term))
    const baseNameLength = normalizedName.length || Number.MAX_SAFE_INTEGER
    const isPrimaryRelease = baseGameCategories.has(result?.category) && !result?.parent_game && !result?.version_parent

    let score = 0

    if (exactMatch) score -= 1000
    else if (startsWithQuery) score -= 400
    else if (containsQuery) score -= 250
    else if (containsAllTerms) score -= 100

    if (isPrimaryRelease) score -= 75
    if (result?.parent_game || result?.version_parent) score += 120
    if (result?.category !== undefined && !baseGameCategories.has(result.category)) score += 40

    score += baseNameLength / 1000

    return score
}

const prioritizeSearchResults = (results, query) => {
    return [...results].sort((left, right) => {
        const leftRank = rankSearchResult(left, query)
        const rightRank = rankSearchResult(right, query)

        if (leftRank !== rightRank) return leftRank - rightRank

        const leftName = left?.name ?? ''
        const rightName = right?.name ?? ''
        const nameComparison = leftName.localeCompare(rightName)
        if (nameComparison !== 0) return nameComparison

        return (left?.id ?? 0) - (right?.id ?? 0)
    })
}

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
        body: `${requested_fields}; search "${escapeIgdbSearchString(game)}"; limit 20;`
    })
    let data = await res.json();
    if (data.message && data.message.startsWith('Authorization')) {
        await authenticate()
        return searchGame(game)
    }

    return Array.isArray(data) ? prioritizeSearchResults(data, game) : data;
}

export async function insertGame(game) {
    try {
        unstable_noStore()
        const valuesForDb = mapValuesForDB(game)
        await sql`INSERT INTO "Games"(title, igdb_id, cover_url, score, rating, summary, comments, genres, platforms, release_date, start_date, finish_date, status, "user", time_to_beat)
                VALUES (${valuesForDb.title}, ${valuesForDb.igdb_id}, ${valuesForDb.cover_url}, ${valuesForDb.score}, ${valuesForDb.rating}, ${valuesForDb.summary}, ${valuesForDb.comments}, 
                ${valuesForDb.genres}, ${valuesForDb.platforms}, ${valuesForDb.release_date}, ${valuesForDb.start_date}, ${valuesForDb.finish_date}, ${valuesForDb.status}, ${valuesForDb.user},
                ${valuesForDb.time_to_beat});`

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
        const valuesForDb = mapValuesForDB(game)
        await sql`UPDATE "Games"
                SET score=${valuesForDb.score}, comments=${valuesForDb.comments}, start_date=${valuesForDb.start_date}, finish_date=${valuesForDb.finish_date}, status=${valuesForDb.status}
                WHERE id=${valuesForDb.id};`
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
