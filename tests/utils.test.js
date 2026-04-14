import {describe, expect, it} from 'vitest'

import {
    compareGames,
    convertArrayForDB,
    defaultSortState,
    getBacklogStats,
    getDateFromIGDB,
    getDateStringFromDB,
    mapValuesForDB,
    mapValuesForInput,
    sortGames
} from '@/app/utils/utils'
import {status} from '@/app/utils/constants'

describe('utils', () => {
    it('formats dates from database timestamps and IGDB unix timestamps', () => {
        expect(getDateStringFromDB('2024-03-10T08:30:00.000Z')).toBe('2024-03-10')
        expect(getDateFromIGDB(1710028800)).toBe('2024-03-10')
    })

    it('converts arrays and nullable fields for database persistence', () => {
        expect(convertArrayForDB(['RPG', 'Action'])).toBe('\'{"RPG","Action"}\'')

        expect(mapValuesForInput({
            start_date: null,
            finish_date: null,
            score: null,
        })).toEqual({
            start_date: '',
            finish_date: '',
            score: 0,
        })

        expect(mapValuesForDB({
            start_date: '',
            finish_date: '',
            score: 0,
            comments: 'note',
        })).toEqual({
            start_date: null,
            finish_date: null,
            score: 0,
            comments: 'note',
        })
    })

    it('keeps the legacy default compare order for started then planned then others', () => {
        const games = [
            {id: 4, status: status.COMPLETED, start_date: '2024-01-03'},
            {id: 3, status: status.PLANNED, start_date: null},
            {id: 2, status: status.STARTED, start_date: '2024-02-10'},
            {id: 1, status: status.STARTED, start_date: '2024-01-10'},
            {id: 5, status: status.DROPPED, start_date: null},
        ]

        expect(games.sort(compareGames).map((game) => game.id)).toEqual([2, 1, 3, 4, 5])
    })
})

describe('sortGames', () => {
    const games = [
        {id: 1, title: 'Zelda', start_date: '2024-02-01', status: status.STARTED, time_to_beat: [30], rating: 90, score: null},
        {id: 2, title: 'animal well', start_date: null, status: status.PLANNED, time_to_beat: [], rating: 95, score: null},
        {id: 3, title: 'Balatro', start_date: '2024-01-15', status: status.COMPLETED, time_to_beat: [12], rating: 88, score: 10},
        {id: 4, title: 'Balatro', start_date: '2024-01-15', status: status.DROPPED, time_to_beat: [18], rating: 70, score: 0},
    ]

    it('uses status ascending as the default sort state', () => {
        expect(sortGames(games, defaultSortState).map((game) => game.id)).toEqual([1, 2, 3, 4])
    })

    it('uses most recent start date as the first tie-breaker within the same status', () => {
        const sameStatusGames = [
            {id: 10, title: 'Older Start', start_date: '2024-01-01', status: status.STARTED, time_to_beat: [10], rating: 80, score: null},
            {id: 11, title: 'No Start Date', start_date: null, status: status.STARTED, time_to_beat: [8], rating: 82, score: null},
            {id: 12, title: 'Recent Start', start_date: '2024-03-01', status: status.STARTED, time_to_beat: [12], rating: 84, score: null},
        ]

        expect(sortGames(sameStatusGames, defaultSortState).map((game) => game.id)).toEqual([12, 10, 11])
    })

    it('sorts titles case-insensitively in both directions', () => {
        expect(sortGames(games, {key: 'title', direction: 'asc'}).map((game) => game.id)).toEqual([2, 3, 4, 1])
        expect(sortGames(games, {key: 'title', direction: 'desc'}).map((game) => game.id)).toEqual([1, 3, 4, 2])
    })

    it('sorts nullable start dates with missing values last in ascending and first in descending', () => {
        expect(sortGames(games, {key: 'start_date', direction: 'asc'}).map((game) => game.id)).toEqual([3, 4, 1, 2])
        expect(sortGames(games, {key: 'start_date', direction: 'desc'}).map((game) => game.id)).toEqual([2, 1, 3, 4])
    })

    it('sorts status in ascending and reversed rank order', () => {
        expect(sortGames(games, {key: 'status', direction: 'asc'}).map((game) => game.id)).toEqual([1, 2, 3, 4])
        expect(sortGames(games, {key: 'status', direction: 'desc'}).map((game) => game.id)).toEqual([4, 3, 2, 1])
    })

    it('sorts by main hours and handles missing HLTB data', () => {
        expect(sortGames(games, {key: 'hours', direction: 'asc'}).map((game) => game.id)).toEqual([3, 4, 1, 2])
        expect(sortGames(games, {key: 'hours', direction: 'desc'}).map((game) => game.id)).toEqual([2, 1, 4, 3])
    })

    it('sorts by user score first, then critic rating, with deterministic tie-breakers', () => {
        expect(sortGames(games, {key: 'rating_score', direction: 'asc'}).map((game) => game.id)).toEqual([4, 3, 1, 2])
        expect(sortGames(games, {key: 'rating_score', direction: 'desc'}).map((game) => game.id)).toEqual([2, 1, 3, 4])
    })
})

describe('getBacklogStats', () => {
    const games = [
        {id: 1, title: 'Animal Well', status: status.COMPLETED, finish_date: '2024-05-12', genres: ['Puzzle', 'Metroidvania'], time_to_beat: [8.5], score: 90, rating: 91.2},
        {id: 2, title: 'Balatro', status: status.COMPLETED, finish_date: '2024-02-24', genres: ['Card'], time_to_beat: [12], score: 100, rating: 96.4},
        {id: 3, title: 'Celeste', status: status.COMPLETED, finish_date: '2025-01-01', genres: ['Platformer'], time_to_beat: [], score: 70, rating: 88.3},
        {id: 4, title: 'Disco Elysium', status: status.PLANNED, finish_date: null, genres: ['RPG'], time_to_beat: [22], rating: 97.1},
        {id: 5, title: 'Outer Wilds', status: status.PLANNED, finish_date: null, genres: ['Adventure'], time_to_beat: [16], rating: 89.6},
        {id: 6, title: 'Portal', status: status.STARTED, finish_date: null, genres: ['Puzzle'], time_to_beat: [4], rating: 90.5},
        {id: 7, title: 'Return of the Obra Dinn', status: status.PLANNED, finish_date: null, genres: ['Puzzle'], time_to_beat: [9]},
    ]

    it('aggregates yearly completions, hours, and genre counts', () => {
        const stats = getBacklogStats(games, () => 0)

        expect(stats.summary).toEqual({
            totalGames: 7,
            completedGames: 3,
            plannedGames: 3,
            totalKnownHours: 71.5,
        })
        expect(stats.gamesCompletedByYear).toEqual([
            {year: '2024', count: 2},
            {year: '2025', count: 1},
        ])
        expect(stats.totalTimeSpentByYear).toEqual([
            {year: '2024', hours: 20.5},
        ])
        expect(stats.topGenre).toEqual({genre: 'Puzzle', count: 3})
        expect(stats.genreBreakdown[0]).toEqual({genre: 'Puzzle', count: 3})
        expect(stats.scoreStats).toEqual({
            averageScore: 86.7,
            highestScore: {title: 'Balatro', value: 100},
            lowestScore: {title: 'Celeste', value: 70},
        })
        expect(stats.completedRatingStats).toEqual({
            averageRating: 92,
            highestRating: {title: 'Balatro', value: 96.4},
            lowestRating: {title: 'Celeste', value: 88.3},
        })
        expect(stats.backlogRatingStats).toEqual({
            averageRating: 92.2,
            highestRating: {title: 'Disco Elysium', value: 97.1},
            lowestRating: {title: 'Celeste', value: 88.3},
        })
    })

    it('returns up to five random planned games and only from planned entries', () => {
        const manyPlanned = [...games, {id: 8, title: 'Hades', status: status.PLANNED, genres: [], time_to_beat: []}, {id: 9, title: 'Kentucky Route Zero', status: status.PLANNED, genres: [], time_to_beat: []}, {id: 10, title: 'Slay the Spire', status: status.PLANNED, genres: [], time_to_beat: []}]
        const stats = getBacklogStats(manyPlanned, () => 0.25)

        expect(stats.randomPlannedGames).toHaveLength(5)
        expect(stats.randomPlannedGames.every((game) => game.status === status.PLANNED)).toBe(true)
    })

    it('ignores zero-valued ratings when selecting the lowest rated game', () => {
        const stats = getBacklogStats([
            {id: 1, title: 'Zero Rated', status: status.COMPLETED, finish_date: '2024-01-01', genres: [], time_to_beat: [], rating: 0},
            {id: 2, title: 'Actual Low', status: status.COMPLETED, finish_date: '2024-01-02', genres: [], time_to_beat: [], rating: 72.4},
            {id: 3, title: 'Higher', status: status.PLANNED, finish_date: null, genres: [], time_to_beat: [], rating: 85.1},
        ], () => 0)

        expect(stats.completedRatingStats.lowestRating).toEqual({title: 'Actual Low', value: 72.4})
        expect(stats.backlogRatingStats.lowestRating).toEqual({title: 'Actual Low', value: 72.4})
    })

    it('returns empty contracts for missing completed, planned, and genre data', () => {
        const stats = getBacklogStats([{id: 99, title: 'Unknown', status: status.STARTED, genres: [], time_to_beat: []}], () => 0)

        expect(stats.gamesCompletedByYear).toEqual([])
        expect(stats.totalTimeSpentByYear).toEqual([])
        expect(stats.genreBreakdown).toEqual([])
        expect(stats.topGenre).toBeNull()
        expect(stats.scoreStats).toEqual({
            averageScore: null,
            highestScore: null,
            lowestScore: null,
        })
        expect(stats.completedRatingStats).toEqual({
            averageRating: null,
            highestRating: null,
            lowestRating: null,
        })
        expect(stats.backlogRatingStats).toEqual({
            averageRating: null,
            highestRating: null,
            lowestRating: null,
        })
        expect(stats.randomPlannedGames).toEqual([])
    })
})
