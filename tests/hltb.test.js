import {describe, expect, it, vi} from 'vitest'

import {HltbParser} from '@/app/lib/hltb/hltbParser'
import {HltbService} from '@/app/lib/hltb/hltbService'
import {HltbSearch} from '@/app/lib/hltb/hltbSearch'

describe('HltbParser', () => {
    it('rounds raw HLTB times to the nearest half hour', () => {
        expect(HltbParser.roundTime(36)).toBe(1)
        expect(HltbParser.roundTime(54)).toBe(1.5)
        expect(HltbParser.roundTime(89)).toBe(2.5)
    })

    it('parses results into sorted entries using similarity', () => {
        const parser = new HltbParser('Persona 3 Reload')

        parser.parseJsonResult({
            data: [
                {
                    game_id: 2,
                    game_name: 'Persona 4 Golden',
                    game_type: 'main',
                    review_score: 90,
                    release_world: 2012,
                    comp_main: 1800,
                },
                {
                    game_id: 1,
                    game_name: 'Persona 3 Reload',
                    game_type: 'main',
                    review_score: 91,
                    release_world: 2024,
                    comp_main: 1440,
                    comp_plus: 1980,
                    comp_100: 2520,
                },
            ],
        })

        const [bestMatch, secondMatch] = parser.getResults()

        expect(bestMatch.name).toBe('Persona 3 Reload')
        expect(bestMatch.gameplayMain).toBe(40)
        expect(bestMatch.gameplayMainExtra).toBe(55)
        expect(bestMatch.gameplayCompletionist).toBe(70)
        expect(bestMatch.similarity).toBe(1)
        expect(secondMatch.name).toBe('Persona 4 Golden')
    })
})

describe('HltbService', () => {
    it('returns null for empty input and delegates parsing for valid input', async () => {
        expect(await new HltbService().search('')).toBeNull()

        const searchSpy = vi.spyOn(HltbSearch, 'searchGame').mockResolvedValue({
            data: [
                {
                    game_id: 10,
                    game_name: 'Elden Ring',
                    game_type: 'main',
                    review_score: 95,
                    release_world: 2022,
                    comp_main: 2160,
                },
            ],
        })

        const results = await new HltbService().search('Elden Ring')

        expect(searchSpy).toHaveBeenCalledWith('Elden Ring')
        expect(results).toHaveLength(1)
        expect(results[0].name).toBe('Elden Ring')
        expect(results[0].gameplayMain).toBe(60)
    })
})
