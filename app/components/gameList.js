'use client'

import {useState} from "react";
import {searchGame, addGame, updateGame, deleteGame} from "@/app/api/gameServer";
import GameDetailEdit from "@/app/components/gameDetailEdit";
import GameSearch from "@/app/components/gameSearch";
import Fuse from 'fuse.js'
import Alert from "@/app/components/alert";
import {compareGames, getDateFromIGDB, getDateStringFromDB, mapValuesForInput} from "@/app/utils/utils";
import {status} from "@/app/utils/constants";

export default function GameList({games,user}) {
    let [displayedGames, setDisplayedGames] = useState(games)
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

    let data = filter === '' ? displayedGames : fuse.search(filter, {limit:15}).map(f=>f.item)


    const getYear = (ts) => {
        const d = new Date(ts)
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
            igdb_id: correctResult.id,
            summary: correctResult.summary,
            genres: correctResult.genres.map(g => g.name),
            platforms: correctResult.platforms.map(p => p.name),
            release_date: correctResult.first_release_date ? getDateFromIGDB(correctResult.first_release_date) : correctResult.first_release_date,
            start_date: game.start_date !== '' ? game.start_date : null,
            finish_date: game.finish_date !== '' ? game.finish_date : null,
            status: game.status,
            rating: correctResult.aggregated_rating ? Math.round(correctResult.aggregated_rating*100) : 0,
            score: game.score,
            comments: game.comments,
            user: user.name
        }
        addGame(newGame)
            .then(res => setDisplayedGames([...displayedGames,res]))
    }

    const handleRowClick = (id) => {
        const pickedGame = displayedGames.find(g => g.id===id)
        setGameDetail(mapValuesForInput(pickedGame))
        setDetailShow(true)
    }

    const handleEdit = async (game) => {
        await updateGame(game)
        setDisplayedGames(displayedGames.map(g => g.id===game.id ? game : g))
    }

    const handleDelete = async () => {
        await deleteGame(gameDetail.id)
        setDetailShow(false)
        setAlertShow(false)
        setDisplayedGames(displayedGames.filter(g => g.id!==gameDetail.id))
    }

    return (<>
        <div className={"flex flex-row mx-auto lg:w-[65%] w-[80%] items-start gap-3 h-svh "}>
            <div className={"flex flex-col gap-2 m-auto h-svh flex-shrink-0 w-[70%]"}>
                <div className={"flex flex-row w-full justify-around border-b-2 border-b-black dark:border-b-white relative top-0 left-0"}>
                    <div className={"lg:w-[15%] w-1/3"}><h1 className={"font-bold text-lg"}>Cover</h1></div>
                    <div className={"lg:w-[40%] w-1/3"}><h1 className={"font-bold text-lg"}>Title</h1></div>
                    <div className={"lg:w-[15%] w-1/3"}><h1 className={"font-bold text-lg"}>Status</h1></div>
                    <div className={"lg:w-[15%] lg:block hidden "}><h1 className={"font-bold text-lg"}>Duration</h1></div>
                    <div className={"lg:w-[15%] lg:block hidden "}><h1 className={"font-bold text-lg"}>Rating/Score</h1></div>
                </div>
                <div className={"overflow-y-scroll max-h-svh flex flex-col gap-2 w-full pb-2"}>
                    {data
                        .map(g => <div onClick={() => handleRowClick(g.id)} key={g.id} className={"flex flex-row w-full gap-2 items-center justify-around"}>
                        <div className={"lg:w-[15%] w-1/2"}><img src={g.cover_url} alt={g.title} /></div>
                        <div className={"lg:w-[40%] w-1/2 align-middle"}>{g.title} ({getYear(g.release_date)})</div>
                        <div className={"lg:w-[15%] w-1/3 align-middle "}>{status.statusLabels[g.status]}</div>
                        <div className={"lg:w-[15%] lg:block hidden align-middle"}>{g.time_to_beat.length > 0 ? g.time_to_beat[0] : 0}h</div>
                        <div className={"lg:w-[15%] lg:block hidden align-middle"}>{g.rating ?? 0}/{g.score ?? 0}</div>
                    </div>)}
                </div>
            </div>
            <GameSearch filter={filter} setFilter={setFilter} search={search} handleAdd={addNewGame} searchResult={searchResult} />
        </div>
            <GameDetailEdit handleDelete={()=>setAlertShow(true)}
                            game={gameDetail}
                            setGame={setGameDetail}
                            visible={detailShow}
                            handleEdit={handleEdit}
                            handleClose={() => setDetailShow(false)} />
        {alertShow && <Alert handleConfirm={handleDelete} handleCancel={()=>setAlertShow(false)} gameTitle={gameDetail.title} />}
        </>
    )
}