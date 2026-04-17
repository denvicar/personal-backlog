import {beforeEach, describe, expect, it, vi} from 'vitest'

const searchSpy = vi.fn()
const noStoreSpy = vi.fn()
const sqlSpy = vi.fn()

vi.mock('next/cache', () => ({
    unstable_noStore: noStoreSpy,
}))

vi.mock('@vercel/postgres', () => ({
    sql: sqlSpy,
}))

vi.mock('@/app/lib/hltb/hltbService', () => ({
    HltbService: class MockHltbService {
        search(...args) {
            return searchSpy(...args)
        }
    },
}))

const loadModule = async () => import('@/app/api/gameServer')

describe('gameServer', () => {
    beforeEach(() => {
        vi.resetModules()
        vi.clearAllMocks()
        process.env.IGDB_TOKEN = 'initial-token'
        process.env.IGDB_CLIENT_ID = 'client-id'
        process.env.IGDB_CLIENT_SECRET = 'client-secret'
        global.fetch = vi.fn()
    })

    it('retries IGDB searches after refreshing authorization', async () => {
        global.fetch
            .mockResolvedValueOnce({
                json: async () => ({message: 'Authorization Failure'}),
            })
            .mockResolvedValueOnce({
                json: async () => ({access_token: 'fresh-token'}),
            })
            .mockResolvedValueOnce({
                json: async () => ([{id: 7, name: 'Balatro'}]),
            })

        const {searchGame} = await loadModule()
        const result = await searchGame('Balatro')

        expect(result).toEqual([{id: 7, name: 'Balatro'}])
        expect(global.fetch).toHaveBeenCalledTimes(3)
        expect(global.fetch.mock.calls[1][0]).toContain('id.twitch.tv/oauth2/token?')
        expect(global.fetch.mock.calls[2][1].headers.Authorization).toBe('Bearer fresh-token')
        expect(global.fetch.mock.calls[2][1].body).toContain('search "Balatro"')
    })

    it('prioritizes exact base-game matches ahead of DLC-style fuzzy results', async () => {
        global.fetch.mockResolvedValue({
            json: async () => ([
                {id: 1, name: 'Persona 3 Reload: Background Music Set', category: 1, parent_game: 90},
                {id: 2, name: 'Persona 3 Reload', category: 0},
                {id: 3, name: 'Persona 3 Reload Digital Artbook', category: 1, parent_game: 90},
                {id: 4, name: 'Persona 3 Reload: Expansion Pass', category: 1, parent_game: 90},
            ]),
        })

        const {searchGame} = await loadModule()
        const result = await searchGame('Persona 3 Reload')

        expect(result.map((entry) => entry.name)).toEqual([
            'Persona 3 Reload',
            'Persona 3 Reload: Expansion Pass',
            'Persona 3 Reload Digital Artbook',
            'Persona 3 Reload: Background Music Set',
        ])
        expect(global.fetch.mock.calls[0][1].body).toContain('limit 20')
    })

    it('adds a game with HLTB timings and persists it through sql', async () => {
        searchSpy.mockResolvedValue([
            {
                gameplayMain: 12,
                gameplayMainExtra: 18.5,
                gameplayCompletionist: 27,
            },
        ])

        sqlSpy
            .mockResolvedValueOnce({rows: []})
            .mockResolvedValueOnce({
                rows: [
                    {
                        ID: 1,
                        TITLE: 'Balatro',
                        USER: 'ciro',
                        TIME_TO_BEAT: [1200, 1850, 2700],
                        RATING: 8750,
                        GENRES: ['Card'],
                        PLATFORMS: ['PC'],
                    },
                ],
            })

        const {addGame} = await loadModule()
        const result = await addGame({
            title: 'Balatro',
            igdb_id: 99,
            cover_url: 'https://images.igdb.com/cover.png',
            score: 9,
            rating: 87.5,
            summary: 'Deckbuilder',
            comments: 'Great run structure',
            genres: ['Card'],
            platforms: ['PC'],
            release_date: '2024-02-20',
            start_date: '2024-03-01',
            finish_date: null,
            status: 'START',
            user: 'ciro',
        })

        const insertValues = sqlSpy.mock.calls[0].slice(1)

        expect(searchSpy).toHaveBeenCalledWith('Balatro')
        expect(sqlSpy).toHaveBeenCalledTimes(2)
        expect(insertValues).toContain(99)
        expect(insertValues).toContainEqual([1200, 1850, 2700])
        expect(noStoreSpy).toHaveBeenCalled()
        expect(result).toEqual({
            id: 1,
            title: 'Balatro',
            user: 'ciro',
            time_to_beat: [12, 18.5, 27],
            rating: 87.5,
            genres: ['Card'],
            platforms: ['PC'],
        })
    })

    it('falls back to empty HLTB timings when the scrape fails', async () => {
        searchSpy.mockRejectedValue(new Error('hltb unavailable'))

        sqlSpy
            .mockResolvedValueOnce({rows: []})
            .mockResolvedValueOnce({
                rows: [
                    {
                        ID: 2,
                        TITLE: 'Inside',
                        USER: 'ciro',
                        TIME_TO_BEAT: [],
                        RATING: 8000,
                        GENRES: ['Puzzle'],
                        PLATFORMS: ['PC'],
                    },
                ],
            })

        const {addGame} = await loadModule()
        const result = await addGame({
            title: 'Inside',
            igdb_id: 45,
            cover_url: '',
            score: null,
            rating: 80,
            summary: 'Atmospheric puzzle platformer',
            comments: '',
            genres: ['Puzzle'],
            platforms: ['PC'],
            release_date: '2016-06-29',
            start_date: null,
            finish_date: null,
            status: 'PLAN',
            user: 'ciro',
        })

        const insertValues = sqlSpy.mock.calls[0].slice(1)

        expect(insertValues).toContainEqual([])
        expect(result.time_to_beat).toEqual([])
    })

    it('formats persisted rows when reading games from the database', async () => {
        sqlSpy.mockResolvedValue({
            rows: [
                {
                    ID: 3,
                    TITLE: 'Animal Well',
                    USER: 'ciro',
                    STATUS: 'COMP',
                    SCORE: 8000,
                    RATING: 9450,
                    TIME_TO_BEAT: [850, 1200, 1500],
                    RELEASE_DATE: '2024-05-09T00:00:00.000Z',
                    START_DATE: '2024-05-10T00:00:00.000Z',
                    FINISH_DATE: '2024-05-12T00:00:00.000Z',
                    GENRES: ["'Puzzle'"],
                    PLATFORMS: ["'PC'"],
                },
            ],
        })

        const {getGames} = await loadModule()
        const result = await getGames('ciro')

        expect(noStoreSpy).toHaveBeenCalled()
        expect(result).toEqual([
            {
                id: 3,
                title: 'Animal Well',
                user: 'ciro',
                status: 'COMP',
                score: 8000,
                rating: 94.5,
                time_to_beat: [8.5, 12, 15],
                release_date: '2024-05-09',
                start_date: '2024-05-10',
                finish_date: '2024-05-12',
                genres: ['Puzzle'],
                platforms: ['PC'],
            },
        ])
    })
})
