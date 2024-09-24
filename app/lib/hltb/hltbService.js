import { HltbSearch as hltb } from "./hltbSearch"
import { HltbParser } from "./hltbParser"

export class HltbService {
    async search(game_name) {
        if (game_name === null || game_name.length === 0) return null
        let resp = await hltb.searchGame(game_name)
        const hltbParser = new HltbParser(game_name)
        if (resp) {
            hltbParser.parseJsonResult(resp)
            return hltbParser.getResults()
        }
    }
}
