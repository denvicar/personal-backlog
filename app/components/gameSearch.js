'use client'

import {useState} from "react";
import Image from "next/image";
import GameDetail from "@/app/components/gameDetail";

export default function GameSearch({searchResult, handleAdd, search, filter, setFilter}) {
    const [game, setGame] = useState({title: '', status: 'PLAN', start_date: '', finish_date: '', score: null, comments: ''})
    const [igdbDetail, setIgdbDetail] = useState()

    const resetInput = () => {
        setGame({title: '', status: 'PLAN', start_date: '', finish_date: '', score: null, comments: ''})
    }

    const add = (id) => {
        handleAdd(id, game)
        resetInput()
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            search(game.title)
        }
    }

    return (
        <>
            <aside className={"panel flex flex-col gap-5 px-4 py-4 sm:px-5 sm:py-5"}>
                <div>
                    <p className={"eyebrow"}>Discover</p>
                    <h2 className={"mt-1 text-2xl font-semibold"}>Add a game</h2>
                    <p className={"muted mt-2 text-sm"}>Search IGDB, choose a status, and import the entry into your backlog.</p>
                </div>

                <div className={"panel-strong space-y-3 px-4 py-4"}>
                    <label className={"block"}>
                        <span className={"mb-2 block text-sm font-semibold"}>Filter your backlog</span>
                        <input
                            type={"text"}
                            placeholder={"Search existing games..."}
                            className={"input-base"}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </label>
                </div>

                <div className={"panel-strong space-y-3 px-4 py-4"}>
                    <label className={"block"}>
                        <span className={"mb-2 block text-sm font-semibold"}>Game title</span>
                        <input
                            type={"text"}
                            placeholder={"Persona 3 Reload"}
                            onKeyDown={(e) => handleKeyPress(e)}
                            value={game.title}
                            className={"input-base"}
                            onChange={(e) => setGame({...game, title: e.target.value})}
                        />
                    </label>

                    <label className={"block"}>
                        <span className={"mb-2 block text-sm font-semibold"}>Status</span>
                        <select className={"input-base"} value={game.status} onChange={(e) => setGame({...game, status: e.target.value})}>
                            <option value={"START"}>Started</option>
                            <option value={"PLAN"}>Planned</option>
                            <option value={"COMP"}>Completed</option>
                            <option value={"DROP"}>Dropped</option>
                        </select>
                    </label>

                    <div className={"grid gap-3 sm:grid-cols-2"}>
                        <label className={"block"}>
                            <span className={"mb-2 block text-sm font-semibold"}>Started on</span>
                            <input className={"input-base"} type={"date"} value={game.start_date} onChange={(e) => setGame({...game, start_date: e.target.value})} />
                        </label>
                        <label className={"block"}>
                            <span className={"mb-2 block text-sm font-semibold"}>Finished on</span>
                            <input className={"input-base"} type={"date"} value={game.finish_date} onChange={(e) => setGame({...game, finish_date: e.target.value})} />
                        </label>
                    </div>

                    {game.status === 'COMP' && (
                        <label className={"block"}>
                            <span className={"mb-2 block text-sm font-semibold"}>Score</span>
                            <input
                                type={"number"}
                                className={"input-base"}
                                placeholder={"8"}
                                value={game.score ? game.score : ''}
                                onChange={(e) => setGame({...game, score: e.target.value})}
                            />
                        </label>
                    )}

                    {(game.status === 'COMP' || game.status === 'DROP') && (
                        <label className={"block"}>
                            <span className={"mb-2 block text-sm font-semibold"}>Comments</span>
                            <textarea
                                className={"input-base min-h-28 resize-y"}
                                placeholder={"What worked, what didn’t, why you stopped..."}
                                value={game.comments}
                                onChange={(e) => setGame({...game, comments: e.target.value})}
                            />
                        </label>
                    )}

                    <button className={"button-base button-primary w-full"} onClick={() => search(game.title)}>Search game</button>
                </div>

                <div>
                    <div className={"mb-3 flex items-center justify-between"}>
                        <h3 className={"text-xl font-semibold"}>Search results</h3>
                        <span className={"muted text-sm"}>{searchResult.length} matches</span>
                    </div>
                    <div className={"scrollable flex max-h-[32rem] flex-col gap-3 overflow-y-auto pr-1"}>
                        {searchResult.map(s => (
                            <div key={s.id} className={"panel-strong flex flex-col gap-4 px-4 py-4 sm:flex-row"}>
                                <div className={"overflow-hidden rounded-2xl bg-[rgb(var(--background))] sm:w-32 sm:flex-shrink-0"}>
                                    {s.cover
                                        ? <Image className={"aspect-[3/4] h-full w-full object-cover"} width={240} height={320} src={`https:${s.cover.url.replace('t_thumb', 't_cover_big')}`} alt={s.name}/>
                                        : <div className={"flex aspect-[3/4] items-center justify-center px-4 text-center text-sm muted"}>No cover</div>}
                                </div>
                                <div className={"flex min-w-0 flex-1 flex-col justify-between gap-4"}>
                                    <div>
                                        <h4 className={"text-lg font-semibold"}>{s.name}</h4>
                                        <p className={"muted mt-2 line-clamp-3 text-sm"}>{s.summary || "No summary available."}</p>
                                    </div>
                                    <div className={"flex gap-2"}>
                                        <button className={"button-base button-secondary flex-1"} onClick={() => setIgdbDetail(s)}>Details</button>
                                        <button className={"button-base button-primary flex-1"} onClick={() => add(s.id)}>Add</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            <GameDetail game={igdbDetail} handleClose={() => setIgdbDetail(null)} />
        </>
    )
}
