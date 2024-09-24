import UserAgent from "user-agents";
import axios from "axios";
import * as cheerio from "cheerio";

export class HltbSearch {
    static BASE_URL = 'https://howlongtobeat.com/'
    static REFERER_HEADER = HltbSearch.BASE_URL
    static SEARCH_URL = HltbSearch.BASE_URL + 'api/search'
    static GAME_URL = HltbSearch.BASE_URL + 'game'

    static getSearchHeaders() {
        const headers = {
            'content-type': 'application/json',
            'accept': '*/*',
            'User-Agent': new UserAgent().toString(),
            'referer': HltbSearch.REFERER_HEADER
        }
        return headers
    }

    static getSearchData(game_name) {
        let payload = {
            'searchType': 'games',
            'searchTerms': game_name.split(' '),
            'searchPage': 1,
            'size': 20,
            'searchOptions': {
                'games': {
                    'userId': 0,
                    'platform': '',
                    'sortCategory': 'popular',
                    'rangeCategory': 'main',
                    'rangeTime': {
                        'min': 0,
                        'max': 0
                    },
                    'gameplay': {
                        'perspective': '',
                        'flow': '',
                        'genre': ''
                    },
                    'modifier': ''
                },
                'users': {
                    'sortCategory': 'postcount'
                },
                'filter': '',
                'sort': 0,
                'randomizer': 0
            }
        }
        return payload
    }

    static async searchGame(name) {
        const headers = HltbSearch.getSearchHeaders()
        const payload = HltbSearch.getSearchData(name)
        let apiKey = await HltbSearch.getRequestCode(false)
        if (!apiKey) {
            apiKey = await HltbSearch.getRequestCode(true)
        }
        const searchUrl = HltbSearch.SEARCH_URL + '/' + apiKey
        let response = await axios.post(searchUrl, payload, {
            headers: headers
        })
        if (response.status === 200) return response.data
        return null
    }

    static async getRequestCode(parseAll) {
        const headers = HltbSearch.getSearchHeaders()
        let response = await axios.get(HltbSearch.BASE_URL, {headers:headers})
        if (response.status === 200 && response.data) {
            let $ = cheerio.load(response.data)
            let $scripts = $('script[src]')
            let srcs = []
            $scripts.each((i,el) => srcs.push($(el).attr('src')))
            if (!parseAll) {
                srcs.filter(s => s.includes('_app-'))
            }
            for (let script_url of srcs) {
                script_url = HltbSearch.BASE_URL + script_url
                let script_response = await axios.get(script_url, {headers: headers}).catch((error) => console.log(error.response.status))
                if (script_response && script_response.status === 200 && script_response.data) {
                    const pattern = /"\/api\/search\/"\.concat\("([a-zA-z0-9]+)"\)/g
                    let match = pattern.exec(script_response.data)
                    if (match !== null) {
                        return match[1]
                    }
                }
            }
        }
        return null
    }


}
