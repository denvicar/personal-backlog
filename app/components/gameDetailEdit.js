'use client'
import {status} from "@/app/utils/constants";
import {useState} from "react";
import {getDateStringFromDB, mapValuesForDB} from "@/app/utils/utils";

export default function GameDetailEdit({game, setGame, handleClose, handleEdit, visible, handleDelete}) {
    let [edit, setEdit] = useState(false)
    let rating = game.rating ? game.rating : 0
    rating = Math.round(rating*100)/100

    const handleSelectChange = (e) => {
        let updatedGame = game
        switch (e.target.value) {
            case status.STARTED:
                updatedGame = {...game, finish_date: '', score: 0, start_date: getDateStringFromDB(Date.now()), status: e.target.value}
                break
            case status.COMPLETED:
                updatedGame = {...game, finish_date: getDateStringFromDB(Date.now()), status: e.target.value}
                break
            case status.PLANNED:
                updatedGame = {...game, start_date: '', finish_date: '', score: 0, status: e.target.value}
                break
            case status.DROPPED:
                updatedGame = {...game, finish_date: '', status: e.target.value}
                break
        }
        setGame(updatedGame)

    }


    if (!visible) return null;
    if (edit) return (
        <div className={"flex flex-col gap-2 items-end lg:w-[40%] fixed top-[5%] left-[10%] lg:top-[15%] lg:left-[30%] lg:max-h-[70%] max-h-[90%] overflow-hidden p-8 border-2 dark:border-white border-black rounded-xl z-10 bg-black w-[80%]"}>
            <button className={"font-bold text-xl"} onClick={handleClose}>x</button>
            <div className={"flex h-[90%] flex-col lg:flex-row gap-2 overflow-y-scroll"}>
                <div className={"w-[60%] lg:w-fit flex-shrink-0"}><img src={game.cover_url} alt={game.title} /> </div>
                <div className={"flex flex-col w-fit overflow-y-scroll"}>
                    <div><span className={"font-bold"}>Title:</span> {game.title}</div>
                    <div><span className={"font-bold"}>Genres:</span> {game.genres.join(", ").trim()}</div>
                    <div><span className={"font-bold"}>Platforms:</span> {game.platforms.join(", ").trim()}</div>
                    <div><span className={"font-bold"}>Duration:</span> {game.time_to_beat[0]}h (Main) {game.time_to_beat[1]}h (+Extra) {game.time_to_beat[2]}h (100%)</div>
                    <div className={"text-black"}><label>
                        <span className={"font-bold dark:text-white mr-2"}>Status:</span> <select value={game.status} onChange={(e) => handleSelectChange(e)}>
                        <option value={"START"}>Started</option>
                        <option value={"PLAN"}>Planned</option>
                        <option value={"COMP"}>Completed</option>
                        <option value={"DROP"}>Dropped</option>
                    </select></label></div>
                    <div hidden={game.status!==status.COMPLETED} className={"text-black"}>
                        <label>
                            <span className={"font-bold dark:text-white mr-2"}>Score:</span>
                            <input type={"number"} value={game.score} onChange={(e)=>setGame({...game,score:e.target.value})} />
                        </label>
                    </div>
                    <div><span className={"font-bold"}>Rating:</span> {rating}</div>
                    <div className={"text-black"}>
                        <label>
                            <span className={"font-bold dark:text-white mr-2"}>Started on:</span>
                            <input type={"date"} value={game.start_date} onChange={(e)=>setGame({...game,start_date:e.target.value})} />
                        </label>
                    </div>
                    <div hidden={game.status!==status.COMPLETED} className={"text-black"}>
                        <label>
                            <span className={"font-bold dark:text-white mr-2"}>Finished on:</span>
                            <input type={"date"} value={game.finish_date} onChange={(e)=>setGame({...game,finish_date:e.target.value})} />
                        </label>
                    </div>
                    <div><span className={"font-bold"}>Summary:</span> {game.summary}</div>
                    <div className={"text-black"}>
                        <label>
                            <span className={"font-bold dark:text-white mr-2"}>Notes:</span>
                            <textarea placeholder={"Comments..."} value={game.comments} onChange={(e)=>setGame({...game,comments:e.target.value})} />
                        </label>
                    </div>
                </div>
            </div>
            <div className={"w-full flex flex-row justify-between"}>
                <button className={"border-2 rounded dark:border-white border-black px-2 py-1"} onClick={() => setEdit(false)}>Cancel</button>
                <button className={"border-2 rounded dark:border-white border-black px-2 py-1"} onClick={()=>{
                    setEdit(false)
                    handleEdit(mapValuesForDB(game))
                }}>Confirm</button>
            </div>
        </div>
    )
    return (
        <div className={"flex flex-col gap-2 items-end lg:w-[40%] fixed top-[5%] left-[10%] lg:top-[15%] lg:left-[30%] lg:max-h-[70%] max-h-[90%] overflow-hidden p-8 border-2 dark:border-white border-black rounded-xl z-10 bg-black w-[80%]"}>
            <button className={"font-bold text-2xl"} onClick={handleClose}>x</button>
            <div className={"flex h-[90%] flex-col lg:flex-row gap-2 overflow-y-scroll"}>
                <div className={"w-[60%] lg:w-fit flex-shrink-0"}><img src={game.cover_url} alt={game.title} /> </div>
                <div className={"flex flex-col w-fit overflow-y-scroll"}>
                    <div><span className={"font-bold"}>Title:</span> {game.title}</div>
                    <div><span className={"font-bold"}>Genres:</span> {game.genres.join(", ").trim()}</div>
                    <div><span className={"font-bold"}>Platforms:</span> {game.platforms.join(", ").trim()}</div>
                    <div><span className={"font-bold"}>Duration:</span> {game.time_to_beat[0]}h (Main) {game.time_to_beat[1]}h (+Extra) {game.time_to_beat[2]}h (100%)</div>
                    <div><span className={"font-bold"}>Status:</span> {status.statusLabels[game.status]}</div>
                    <div hidden={game.status!==status.COMPLETED}><span className={"font-bold"}>Score:</span> {game.score}</div>
                    <div><span className={"font-bold"}>Rating:</span> {rating}</div>
                    <div><span className={"font-bold"}>Started on:</span> {game.start_date}</div>
                    <div hidden={game.status!==status.COMPLETED}><span className={"font-bold"}>Finished on:</span> {game.finish_date}</div>
                    <div><span className={"font-bold"}>Summary:</span> {game.summary}</div>
                    <div><span className={"font-bold"}>Notes:</span> {game.comments}</div>
                </div>
            </div>
            <div className={"w-full flex flex-row justify-between"}>
                <button className={"border-2 rounded dark:border-white border-black px-2 py-1"} onClick={() => handleDelete()}>Delete game</button>
                <button className={"border-2 rounded dark:border-white border-black px-2 py-1"} onClick={() => setEdit(true)}>Edit</button>
            </div>
        </div>
    )
}