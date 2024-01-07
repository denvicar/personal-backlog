'use client'
import {status} from "@/app/utils/constants";
import {useState} from "react";

export default function GameDetail({game, setGame, handleClose, handleEdit, visible, handleDelete}) {
    let [edit, setEdit] = useState(false)
    let rating = game.rating ? game.rating : 0
    rating = Math.round(rating*100)/100
    if (!visible) return null;
    if (edit) return (
        <div className={"flex flex-col gap-2 items-end w-[40%] fixed top-[15%] left-[30%] max-h-[70%] overflow-hidden p-8 border-2 dark:border-white border-black rounded-xl z-10 bg-black"}>
            <button className={"font-bold text-xl"} onClick={handleClose}>x</button>
            <div className={"flex h-[90%] flex-row gap-2 overflow-y-scroll"}>
                <div className={"w-fit flex-shrink-0"}><img src={game.cover_url} /> </div>
                <div className={"flex flex-col w-fit overflow-y-scroll"}>
                    <div><span className={"font-bold"}>Title:</span> {game.title}</div>
                    <div><span className={"font-bold"}>Genres:</span> {game.genres.join(", ").trim()}</div>
                    <div><span className={"font-bold"}>Platforms:</span> {game.platforms.join(", ").trim()}</div>
                    <div className={"text-black"}><label>
                        <span className={"font-bold dark:text-white mr-2"}>Status:</span> <select value={game.status} onChange={(e) => setGame({...game,status:e.target.value})}>
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
                            <input type={"date"} value={game.date_started} onChange={(e)=>setGame({...game,date_started:e.target.value})} />
                        </label>
                    </div>
                    <div hidden={game.status!==status.COMPLETED} className={"text-black"}>
                        <label>
                            <span className={"font-bold dark:text-white mr-2"}>Finished on:</span>
                            <input type={"date"} value={game.date_finished} onChange={(e)=>setGame({...game,date_finished:e.target.value})} />
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
                    handleEdit(game)
                }}>Confirm</button>
            </div>
        </div>
    )
    return (
        <div className={"flex flex-col gap-2 items-end w-[40%] fixed top-[15%] left-[30%] max-h-[70%] overflow-hidden p-8 border-2 dark:border-white border-black rounded-xl z-10 bg-black"}>
            <button className={"font-bold text-2xl"} onClick={handleClose}>x</button>
            <div className={"flex h-[90%] flex-row gap-2 overflow-y-scroll"}>
                <div className={"w-fit flex-shrink-0"}><img src={game.cover_url} /> </div>
                <div className={"flex flex-col w-fit overflow-y-scroll"}>
                    <div><span className={"font-bold"}>Title:</span> {game.title}</div>
                    <div><span className={"font-bold"}>Genres:</span> {game.genres.join(", ").trim()}</div>
                    <div><span className={"font-bold"}>Platforms:</span> {game.platforms.join(", ").trim()}</div>
                    <div><span className={"font-bold"}>Status:</span> {status.statusLabels[game.status]}</div>
                    <div hidden={game.status!==status.COMPLETED}><span className={"font-bold"}>Score:</span> {game.score}</div>
                    <div><span className={"font-bold"}>Rating:</span> {rating}</div>
                    <div><span className={"font-bold"}>Started on:</span> {game.date_started}</div>
                    <div hidden={game.status!==status.COMPLETED}><span className={"font-bold"}>Finished on:</span> {game.date_finished}</div>
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