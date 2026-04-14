import {status} from "@/app/utils/constants";

export const defaultSortState = {
    key: 'status',
    direction: 'asc'
}

const statusOrder = {
    [status.STARTED]: 0,
    [status.PLANNED]: 1,
    [status.COMPLETED]: 2,
    [status.DROPPED]: 3
}

const normalizeString = (value) => (value ?? '').toString().trim().toLowerCase()

const compareStrings = (left, right) => normalizeString(left).localeCompare(normalizeString(right))

const compareNullableNumber = (left, right) => {
    const leftMissing = left === null || left === undefined
    const rightMissing = right === null || right === undefined
    if (leftMissing && rightMissing) return 0
    if (leftMissing) return 1
    if (rightMissing) return -1
    if (left === right) return 0
    return left - right
}

const getPrimaryScore = (game) => {
    if (game.score !== null && game.score !== undefined && Number(game.score) !== 0) {
        return Number(game.score)
    }
    if (game.rating !== null && game.rating !== undefined) {
        return Number(game.rating)
    }
    return 0
}

const getDateValue = (value) => {
    if (!value) return null
    const timestamp = new Date(value).getTime()
    return Number.isNaN(timestamp) ? null : timestamp
}

const getHoursValue = (game) => {
    if (!game.time_to_beat || game.time_to_beat.length === 0) return null
    const hours = Number(game.time_to_beat[0])
    return Number.isNaN(hours) ? null : hours
}

const compareWithTieBreakers = (left, right, primaryCompare, direction) => {
    if (primaryCompare !== 0) {
        return direction === 'asc' ? primaryCompare : -primaryCompare
    }

    const titleCompare = compareStrings(left.title, right.title)
    if (titleCompare !== 0) return titleCompare
    return (left.id ?? 0) - (right.id ?? 0)
}

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

export const compareGames = (g1,g2) => {
    if (g1.id===g2.id) return 0;
    if (g1.status === g2.status) {
        if (g1.start_date && g2.start_date) {
            return -1 * (new Date(g1.start_date) - new Date(g2.start_date))
        } else if (g1.start_date) return -1;
        else if (g2.start_date) return 1;
        else return g1.id - g2.id
    } else if (g1.status===status.STARTED) return -1;
    else if (g2.status === status.STARTED) return 1;
    else if (g1.status === status.PLANNED) return -1;
    else if (g2.status === status.PLANNED) return 1;
    else return g1.id-g2.id
}

/**
 * @param {Array<Object>} games
 * @param {{ key: 'title' | 'start_date' | 'status' | 'hours' | 'rating_score', direction: 'asc' | 'desc' }} sortState
 */
export const sortGames = (games, sortState = defaultSortState) => {
    const {key, direction} = sortState
    return [...games].sort((left, right) => {
        let primaryCompare = 0

        switch (key) {
            case 'title':
                primaryCompare = compareStrings(left.title, right.title)
                break
            case 'start_date':
                primaryCompare = compareNullableNumber(getDateValue(left.start_date), getDateValue(right.start_date))
                break
            case 'status':
                primaryCompare = compareNullableNumber(statusOrder[left.status], statusOrder[right.status])
                break
            case 'hours':
                primaryCompare = compareNullableNumber(getHoursValue(left), getHoursValue(right))
                break
            case 'rating_score':
                primaryCompare = compareNullableNumber(getPrimaryScore(left), getPrimaryScore(right))
                break
            default:
                primaryCompare = 0
        }

        return compareWithTieBreakers(left, right, primaryCompare, direction)
    })
}

const sumMainHours = (games) => games.reduce((total, game) => total + (getHoursValue(game) ?? 0), 0)

const groupByYear = (games, mapper, fieldName) => {
    const groups = new Map()

    for (const game of games) {
        const year = game.finish_date ? new Date(game.finish_date).getFullYear() : null
        if (!year || Number.isNaN(year)) continue
        const current = groups.get(year) ?? 0
        groups.set(year, current + mapper(game))
    }

    return [...groups.entries()]
        .sort((left, right) => left[0] - right[0])
        .map(([year, value]) => ({year: year.toString(), [fieldName]: value}))
}

/**
 * @param {Array<Object>} games
 * @param {() => number} rng
 * @returns {{
 *   summary: { totalGames: number, completedGames: number, plannedGames: number, totalKnownHours: number },
 *   gamesCompletedByYear: Array<{ year: string, count: number }>,
 *   totalTimeSpentByYear: Array<{ year: string, hours: number }>,
 *   genreBreakdown: Array<{ genre: string, count: number }>,
 *   topGenre: { genre: string, count: number } | null,
 *   randomPlannedGames: Array<Object>
 * }}
 */
export const getBacklogStats = (games, rng = Math.random) => {
    const completedGames = games.filter((game) => game.status === status.COMPLETED)
    const plannedGames = games.filter((game) => game.status === status.PLANNED)
    const gamesWithHours = games.filter((game) => getHoursValue(game) !== null)

    const genreCounts = new Map()
    for (const game of games) {
        for (const genre of (game.genres ?? [])) {
            genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1)
        }
    }

    const genreBreakdown = [...genreCounts.entries()]
        .sort((left, right) => {
            if (right[1] !== left[1]) return right[1] - left[1]
            return compareStrings(left[0], right[0])
        })
        .map(([genre, count]) => ({genre, count}))

    const shuffledPlanned = [...plannedGames]
    for (let index = shuffledPlanned.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(rng() * (index + 1))
        const current = shuffledPlanned[index]
        shuffledPlanned[index] = shuffledPlanned[swapIndex]
        shuffledPlanned[swapIndex] = current
    }

    return {
        summary: {
            totalGames: games.length,
            completedGames: completedGames.length,
            plannedGames: plannedGames.length,
            totalKnownHours: Math.round(sumMainHours(gamesWithHours) * 10) / 10,
        },
        gamesCompletedByYear: groupByYear(
            completedGames.filter((game) => game.finish_date),
            () => 1,
            'count'
        ),
        totalTimeSpentByYear: groupByYear(
            completedGames.filter((game) => game.finish_date && getHoursValue(game) !== null),
            (game) => Math.round((getHoursValue(game) ?? 0) * 10) / 10,
            'hours'
        ),
        genreBreakdown,
        topGenre: genreBreakdown[0] ?? null,
        randomPlannedGames: shuffledPlanned.slice(0, 5),
    }
}
