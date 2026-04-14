'use client'
import {status} from "@/app/utils/constants";
import {useState} from "react";
import Image from "next/image";
import {getDateStringFromDB, mapValuesForDB} from "@/app/utils/utils";

const statusTone = {
    [status.STARTED]: "bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100",
    [status.PLANNED]: "bg-sky-200/75 text-sky-900 dark:bg-sky-900/45 dark:text-sky-100",
    [status.COMPLETED]: "bg-amber-200/75 text-amber-900 dark:bg-amber-900/45 dark:text-amber-100",
    [status.DROPPED]: "bg-rose-200/75 text-rose-900 dark:bg-rose-950/45 dark:text-rose-100",
}

export default function GameDetailEdit({game, setGame, handleClose, handleEdit, visible, handleDelete}) {
    const [edit, setEdit] = useState(false)
    let rating = game.rating ? game.rating : 0
    rating = Math.round(rating * 100) / 100

    const handleSelectChange = (e) => {
        let updatedGame = game
        switch (e.target.value) {
            case status.STARTED:
                updatedGame = {...game, finish_date: '', score: null, start_date: getDateStringFromDB(Date.now()), status: e.target.value}
                break
            case status.COMPLETED:
                updatedGame = {...game, finish_date: getDateStringFromDB(Date.now()), status: e.target.value}
                break
            case status.PLANNED:
                updatedGame = {...game, start_date: '', finish_date: '', score: null, status: e.target.value}
                break
            case status.DROPPED:
                updatedGame = {...game, finish_date: '', score: null, status: e.target.value}
                break
        }
        setGame(updatedGame)
    }

    if (!visible) return null;

    const onConfirm = () => {
        setEdit(false)
        handleEdit(mapValuesForDB(game))
    }

    return (
        <div className={"modal-backdrop"} onClick={handleClose}>
            <div className={"panel scrollable relative z-50 flex max-h-[94vh] w-full max-w-5xl flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6"} onClick={(e) => e.stopPropagation()}>
                <div className={"mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"}>
                    <div>
                        <p className={"eyebrow"}>{edit ? "Edit Entry" : "Game Entry"}</p>
                        <h2 className={"mt-1 text-3xl font-semibold"}>{game.title}</h2>
                        <div className={"mt-3 flex flex-wrap gap-2"}>
                            <span className={`status-pill ${statusTone[game.status]}`}>{status.statusLabels[game.status]}</span>
                            <span className={"status-pill bg-white/55 dark:bg-white/10"}>{game.time_to_beat?.[0] ?? 0}h main</span>
                            <span className={"status-pill bg-white/55 dark:bg-white/10"}>{rating} critic</span>
                        </div>
                    </div>
                    <button className={"button-base button-secondary px-3 py-2"} onClick={handleClose}>Close</button>
                </div>

                <div className={"grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]"}>
                    <div className={"space-y-4"}>
                        <div className={"overflow-hidden rounded-[24px] bg-[rgb(var(--background))]"}>
                            {game.cover_url
                                ? <Image className={"aspect-[3/4] h-full w-full object-cover"} width={260} height={346} src={game.cover_url.replace('http:', 'https:')} alt={game.title}/>
                                : <div className={"flex aspect-[3/4] items-center justify-center px-4 text-center text-sm muted"}>No cover</div>}
                        </div>
                        <div className={"panel-strong px-4 py-4"}>
                            <p className={"eyebrow"}>Play time</p>
                            <div className={"mt-3 grid gap-3 text-sm sm:grid-cols-3"}>
                                <div>
                                    <span className={"font-semibold"}>Main</span>
                                    <p className={"mt-1 muted"}>{game.time_to_beat?.[0] ?? 0}h</p>
                                </div>
                                <div>
                                    <span className={"font-semibold"}>Main + Extra</span>
                                    <p className={"mt-1 muted"}>{game.time_to_beat?.[1] ?? 0}h</p>
                                </div>
                                <div>
                                    <span className={"font-semibold"}>100%</span>
                                    <p className={"mt-1 muted"}>{game.time_to_beat?.[2] ?? 0}h</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {edit ? (
                        <div className={"space-y-4"}>
                            <div className={"panel-strong px-4 py-4"}>
                                <p className={"eyebrow"}>Metadata</p>
                                <div className={"mt-3 space-y-3 text-sm"}>
                                    <div><span className={"font-semibold"}>Genres:</span> {game.genres.join(", ").trim()}</div>
                                    <div><span className={"font-semibold"}>Platforms:</span> {game.platforms.join(", ").trim()}</div>
                                    <div><span className={"font-semibold"}>Rating:</span> {rating}</div>
                                </div>
                            </div>

                            <div className={"panel-strong space-y-4 px-4 py-4"}>
                                <label className={"block"}>
                                    <span className={"mb-2 block text-sm font-semibold"}>Status</span>
                                    <select className={"input-base"} value={game.status} onChange={(e) => handleSelectChange(e)}>
                                        <option value={"START"}>Started</option>
                                        <option value={"PLAN"}>Planned</option>
                                        <option value={"COMP"}>Completed</option>
                                        <option value={"DROP"}>Dropped</option>
                                    </select>
                                </label>

                                {game.status === status.COMPLETED && (
                                    <label className={"block"}>
                                        <span className={"mb-2 block text-sm font-semibold"}>Score</span>
                                        <input type={"number"} min={"0"} max={"100"} step={"1"} className={"input-base"} value={game.score ?? ''} onChange={(e) => setGame({...game, score: e.target.value})} />
                                    </label>
                                )}

                                <div className={"grid gap-3 sm:grid-cols-2"}>
                                    <label className={"block"}>
                                        <span className={"mb-2 block text-sm font-semibold"}>Started on</span>
                                        <input type={"date"} className={"input-base"} value={game.start_date} onChange={(e) => setGame({...game, start_date: e.target.value})} />
                                    </label>
                                    {game.status === status.COMPLETED && (
                                        <label className={"block"}>
                                            <span className={"mb-2 block text-sm font-semibold"}>Finished on</span>
                                            <input type={"date"} className={"input-base"} value={game.finish_date} onChange={(e) => setGame({...game, finish_date: e.target.value})} />
                                        </label>
                                    )}
                                </div>

                                <label className={"block"}>
                                    <span className={"mb-2 block text-sm font-semibold"}>Notes</span>
                                    <textarea className={"input-base min-h-32 resize-y"} placeholder={"Comments..."} value={game.comments} onChange={(e) => setGame({...game, comments: e.target.value})} />
                                </label>
                            </div>

                            <div className={"panel-strong px-4 py-4"}>
                                <p className={"eyebrow"}>Summary</p>
                                <p className={"mt-3 text-sm leading-6"}>{game.summary}</p>
                            </div>

                            <div className={"flex flex-col gap-3 sm:flex-row sm:justify-between"}>
                                <button className={"button-base button-secondary"} onClick={() => setEdit(false)}>Cancel</button>
                                <button className={"button-base button-primary"} onClick={onConfirm}>Save changes</button>
                            </div>
                        </div>
                    ) : (
                        <div className={"space-y-4"}>
                            <div className={"grid gap-4 sm:grid-cols-2"}>
                                <div className={"panel-strong px-4 py-4"}>
                                    <p className={"eyebrow"}>Genres</p>
                                    <p className={"mt-3 text-sm"}>{game.genres.join(", ").trim()}</p>
                                </div>
                                <div className={"panel-strong px-4 py-4"}>
                                    <p className={"eyebrow"}>Platforms</p>
                                    <p className={"mt-3 text-sm"}>{game.platforms.join(", ").trim()}</p>
                                </div>
                                <div className={"panel-strong px-4 py-4"}>
                                    <p className={"eyebrow"}>Score</p>
                                    <p className={"mt-3 text-sm"}>{game.status === status.COMPLETED ? game.score : "Not scored"}</p>
                                </div>
                                <div className={"panel-strong px-4 py-4"}>
                                    <p className={"eyebrow"}>Dates</p>
                                    <p className={"mt-3 text-sm"}>Started: {game.start_date || "N/A"}</p>
                                    <p className={"mt-1 text-sm"}>Finished: {game.finish_date || "N/A"}</p>
                                </div>
                            </div>

                            <div className={"panel-strong px-4 py-4"}>
                                <p className={"eyebrow"}>Summary</p>
                                <p className={"mt-3 text-sm leading-6"}>{game.summary}</p>
                            </div>

                            <div className={"panel-strong px-4 py-4"}>
                                <p className={"eyebrow"}>Notes</p>
                                <p className={"mt-3 text-sm leading-6"}>{game.comments || "No notes yet."}</p>
                            </div>

                            <div className={"flex flex-col gap-3 sm:flex-row sm:justify-between"}>
                                <button className={"button-base button-danger"} onClick={() => handleDelete()}>Delete game</button>
                                <button className={"button-base button-primary"} onClick={() => setEdit(true)}>Edit entry</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
