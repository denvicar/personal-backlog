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

const roundScore = (value) => Math.round(value * 10) / 10

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

const parseNumericValue = (value, {nullIfMissing = false} = {}) => {
    if (value === null || value === undefined || value === '') {
        return nullIfMissing ? null : 0
    }

    const parsed = Number(value)
    if (Number.isNaN(parsed)) {
        return nullIfMissing ? null : 0
    }
    return parsed
}

const getPrimaryScore = (game) => {
    const userScore = parseNumericValue(game.score, {nullIfMissing: true})
    if (userScore !== null) {
        return userScore
    }
    const rating = parseNumericValue(game.rating, {nullIfMissing: true})
    if (rating !== null) {
        return rating
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

const compareTieBreakerDates = (left, right) => {
    const leftDate = getDateValue(left.start_date)
    const rightDate = getDateValue(right.start_date)
    const leftMissing = leftDate === null
    const rightMissing = rightDate === null

    if (leftMissing && rightMissing) return 0
    if (leftMissing) return 1
    if (rightMissing) return -1
    return rightDate - leftDate
}

const compareWithTieBreakers = (left, right, primaryCompare, direction) => {
    if (primaryCompare !== 0) {
        return direction === 'asc' ? primaryCompare : -primaryCompare
    }

    const startDateCompare = compareTieBreakerDates(left, right)
    if (startDateCompare !== 0) return startDateCompare

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
        score: game.score !== null ? parseNumericValue(game.score) : 0
    }
}

export const mapValuesForDB = (game) => {
    return {...game,
        start_date: game.start_date !== '' ? game.start_date : null,
        finish_date: game.finish_date !== '' ? game.finish_date : null,
        score: game.score !== '' && game.score !== null && game.score !== undefined ? parseNumericValue(game.score, {nullIfMissing: true}) : null
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

const getAssignedCompletedScore = (game, scope = 'completed') => {
    if (scope === 'completed' && game.status !== status.COMPLETED) return null
    return parseNumericValue(game.score, {nullIfMissing: true})
}

const getAssignedRating = (game, scope = 'completed') => {
    if (scope === 'completed' && game.status !== status.COMPLETED) return null
    return parseNumericValue(game.rating, {nullIfMissing: true})
}

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
 *   scoreStats: {
 *     averageScore: number | null,
 *     highestScore: { title: string, value: number } | null,
 *     lowestScore: { title: string, value: number } | null
 *   },
 *   completedRatingStats: {
 *     averageRating: number | null,
 *     highestRating: { title: string, value: number } | null,
 *     lowestRating: { title: string, value: number } | null
 *   },
 *   backlogRatingStats: {
 *     averageRating: number | null,
 *     highestRating: { title: string, value: number } | null,
 *     lowestRating: { title: string, value: number } | null
 *   },
 *   randomPlannedGames: Array<Object>
 * }}
 */
export const getBacklogStats = (games, rng = Math.random) => {
    const completedGames = games.filter((game) => game.status === status.COMPLETED)
    const plannedGames = games.filter((game) => game.status === status.PLANNED)
    const gamesWithHours = games.filter((game) => getHoursValue(game) !== null)
    const completedGamesWithAssignedScore = completedGames
        .map((game) => ({game, value: getAssignedCompletedScore(game)}))
        .filter((entry) => entry.value !== null)
    const completedGamesWithAssignedRating = completedGames
        .map((game) => ({game, value: getAssignedRating(game)}))
        .filter((entry) => entry.value !== null)
    const backlogGamesWithAssignedRating = games
        .map((game) => ({game, value: getAssignedRating(game, 'backlog')}))
        .filter((entry) => entry.value !== null)

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

    const summarizeRatings = (entries) => {
        const sorted = [...entries].sort((left, right) => {
            if (left.value !== right.value) return left.value - right.value
            const titleCompare = compareStrings(left.game.title, right.game.title)
            if (titleCompare !== 0) return titleCompare
            return (left.game.id ?? 0) - (right.game.id ?? 0)
        })

        const average = sorted.length > 0
            ? roundScore(sorted.reduce((total, entry) => total + entry.value, 0) / sorted.length)
            : null

        return {
            average,
            highest: sorted.length > 0
                ? {title: sorted[sorted.length - 1].game.title, value: sorted[sorted.length - 1].value}
                : null,
            lowest: sorted.length > 0
                ? {title: sorted[0].game.title, value: sorted[0].value}
                : null,
        }
    }

    const scoreSummary = summarizeRatings(completedGamesWithAssignedScore)
    const completedRatingSummary = summarizeRatings(completedGamesWithAssignedRating)
    const backlogRatingSummary = summarizeRatings(backlogGamesWithAssignedRating)

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
        scoreStats: {
            averageScore: scoreSummary.average,
            highestScore: scoreSummary.highest,
            lowestScore: scoreSummary.lowest,
        },
        completedRatingStats: {
            averageRating: completedRatingSummary.average,
            highestRating: completedRatingSummary.highest,
            lowestRating: completedRatingSummary.lowest,
        },
        backlogRatingStats: {
            averageRating: backlogRatingSummary.average,
            highestRating: backlogRatingSummary.highest,
            lowestRating: backlogRatingSummary.lowest,
        },
        randomPlannedGames: shuffledPlanned.slice(0, 5),
    }
}
