import {describe, expect, it} from 'vitest'

import {compareGames, convertArrayForDB, getDateFromIGDB, getDateStringFromDB, mapValuesForDB, mapValuesForInput} from '@/app/utils/utils'
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
            score: null,
            comments: 'note',
        })
    })

    it('orders started games first, then planned games, then others', () => {
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
