'use client'

import {useState} from "react";
import {searchGame, addGame, updateGame, deleteGame} from "@/app/api/gameServer";
import GameDetail from "@/app/components/gameDetail";
import GameSearch from "@/app/components/gameSearch";
import Fuse from 'fuse.js'
import Alert from "@/app/components/alert";

export default function GameList({games}) {
    let [displayedGames, setDisplayedGames] = useState(games.filter(g => g.user==='Ciro' && g.genres))
    let [searchResult, setSearchResult] = useState([])
    let [gameDetail, setGameDetail] = useState({})
    let [detailShow, setDetailShow] = useState(false)
    let [filter, setFilter] = useState('')
    let [alertShow, setAlertShow] = useState(false)


    const options = {
        includeScore: false,
        keys: ['title']
    }
    const fuse = new Fuse(displayedGames,options)

    const data = filter === '' ? displayedGames : fuse.search(filter, {limit:15}).map(f=>f.item)


    const getYear = (ts) => {
        const d = new Date(ts*1000)
        return d.getFullYear();
    }

    const search = async (searchString) => {
        let res = await searchGame(searchString)
        setSearchResult(res)
    }

    const addNewGame = async (id,game) => {
        const correctResult = searchResult.find(s=>s.id===id)
        let newGame = {
            title: correctResult.name,
            cover_url: `http:${correctResult.cover.url.replace('t_thumb','t_cover_big')}`,
            id: games[games.length-1].id+1,
            igdb_id: correctResult.id,
            summary: correctResult.summary,
            genres: correctResult.genres.map(g => g.name),
            platforms: correctResult.platforms.map(p => p.name),
            release_date: correctResult.first_release_date,
            date_started: game.start_date,
            date_finished: game.finish_date,
            status: game.status,
            rating: correctResult.aggregated_rating ? correctResult.aggregated_rating/10 : 0,
            score: game.score,
            comments: game.comments
        }
        const addedGame = await addGame(newGame)
        setDisplayedGames([...displayedGames,addedGame])
    }

    const handleRowClick = (id) => {
        const pickedGame = displayedGames.find(g => g.id===id)
        setGameDetail(pickedGame)
        setDetailShow(true)
    }

    const handleEdit = async (game) => {
        const updated = await updateGame(game)
        setDisplayedGames(displayedGames.map(g=>g.id===game.id ? updated : g))
    }

    const handleDelete = async () => {
        const db = await deleteGame(gameDetail.id)
        setDetailShow(false)
        setAlertShow(false)
        setDisplayedGames(db)
    }

    return (<>
        <div className={"flex flex-row mx-auto lg:w-1/2 w-[75%] items-start gap-3 h-svh "}>
            <div className={"flex flex-col gap-2 m-auto h-svh flex-shrink-0 w-[70%]"}>
                <div className={"flex flex-row w-full justify-around border-b-2 border-b-black dark:border-b-white relative top-0 left-0 bg-black"}>
                    <div className={"lg:w-[15%] w-1/3"}><h1 className={"font-bold text-lg"}>Cover</h1></div>
                    <div className={"lg:w-[33%] w-1/3"}><h1 className={"font-bold text-lg"}>Title</h1></div>
                    <div className={"lg:w-[7%] w-1/3"}><h1 className={"font-bold text-lg"}>Status</h1></div>
                </div>
                <div className={"overflow-y-scroll max-h-svh flex flex-col gap-2 w-full pb-2"}>
                    {data
                        .map(g => <div onClick={() => handleRowClick(g.id)} key={g.id} className={"flex flex-row w-full items-center justify-around  "}>
                        <div className={"lg:w-[15%] w-1/3"}><img src={g.cover_url} /></div>
                        <div className={"lg:w-[33%] w-1/3 align-"}>{g.title} ({getYear(g.release_date)})</div>
                        <div className={"lg:w-[7%] w-1/3 align-middle "}>{g.status}</div>
                    </div>)}
                </div>
            </div>
            <GameSearch filter={filter} setFilter={setFilter} search={search} handleAdd={addNewGame} searchResult={searchResult} />
        </div>
            <GameDetail handleDelete={()=>setAlertShow(true)}
                        game={gameDetail}
                        setGame={setGameDetail}
                        visible={detailShow}
                        handleEdit={handleEdit}
                        handleClose={() => setDetailShow(false)} />
        {alertShow && <Alert handleConfirm={handleDelete} handleCancel={()=>setAlertShow(false)} gameTitle={gameDetail.title} />}
        </>
    )
}