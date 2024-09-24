import { HltbEntry } from "./hltbEntry"
import levenshtein from 'fast-levenshtein'

export class HltbParser {
    constructor(game_name) {
        this.game_name = game_name
        this.results = []
    }
    parseJsonResult(result) {
        console.log(result)
        for (let game of result.data) {
            this.results.push(this.parseJsonElement(game))
        }
    }

    parseJsonElement(element) {
        const entry = new HltbEntry(
            element.game_id,
            element.game_name,
            element.game_type,
            element.review_score,
            element.release_world,
            element.json_content = JSON.stringify(element),
            'comp_main' in element ? HltbParser.roundTime(element.comp_main) : 0,
            'comp_plus' in element ? HltbParser.roundTime(element.comp_plus) : 0,
            'comp_100' in element ? HltbParser.roundTime(element.comp_100) : 0,
            HltbParser.similar(this.game_name, element.game_name),
            this.game_name
        )

        console.log(entry)

        return entry
    }

    getResults() {
        this.results = this.results.sort((el1, el2) => el2.similarity - el1.similarity)
        return this.results
    }

    static roundTime(a) {
        const hours = Math.trunc(a / 36)/100
        return Math.round(hours*2)/2
    }

    static similar(a,b) {
        let longer = ''
        if (a.length < b.length) longer = b; else longer = a
        if (longer.length===0) return 1.0
        const distance = levenshtein.get(a,b)
        return Math.round(((longer.length-distance)/longer.length)*100) / 100
    }
    
}