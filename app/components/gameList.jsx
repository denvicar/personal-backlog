'use client'

import {useState} from "react";
import Image from "next/image";
import {searchGame, addGame, updateGame, deleteGame} from "@/app/api/gameServer";
import GameDetailEdit from "@/app/components/gameDetailEdit";
import GameSearch from "@/app/components/gameSearch";
import Fuse from 'fuse.js'
import Alert from "@/app/components/alert";
import AppNavigation from "@/app/components/appNavigation";
import {defaultSortState, getDateFromIGDB, mapValuesForInput, sortGames} from "@/app/utils/utils";
import {status} from "@/app/utils/constants";

const sortOptions = [
    {key: 'title', label: 'Title'},
    {key: 'start_date', label: 'Start Date'},
    {key: 'status', label: 'Status'},
    {key: 'hours', label: 'Hours'},
    {key: 'rating_score', label: 'Rating / Score'},
]

const statusTone = {
    [status.STARTED]: "bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100",
    [status.PLANNED]: "bg-sky-200/75 text-sky-900 dark:bg-sky-900/45 dark:text-sky-100",
    [status.COMPLETED]: "bg-amber-200/75 text-amber-900 dark:bg-amber-900/45 dark:text-amber-100",
    [status.DROPPED]: "bg-rose-200/75 text-rose-900 dark:bg-rose-950/45 dark:text-rose-100",
}

const formatDisplayDate = (value) => {
    if (!value) return 'N/A'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-CA', {year: 'numeric', month: 'short', day: 'numeric'})
}

const getYear = (ts) => {
    const d = new Date(ts)
    return Number.isNaN(d.getTime()) ? 'TBA' : d.getFullYear();
}

export default function GameList({games, user}) {
    const [displayedGames, setDisplayedGames] = useState(games)
    const [searchResult, setSearchResult] = useState([])
    const [gameDetail, setGameDetail] = useState({})
    const [detailShow, setDetailShow] = useState(false)
    const [filter, setFilter] = useState('')
    const [alertShow, setAlertShow] = useState(false)
    const [sortState, setSortState] = useState(defaultSortState)

    const fuse = new Fuse(displayedGames, {
        includeScore: false,
        keys: ['title']
    })

    const filteredGames = filter === '' ? displayedGames : fuse.search(filter).map(f => f.item)
    const data = sortGames(filteredGames, sortState)

    const search = async (searchString) => {
        const res = await searchGame(searchString)
        setSearchResult(res)
    }

    const addNewGame = async (id, game) => {
        const correctResult = searchResult.find(s => s.id === id)
        if (!correctResult) return
        const newGame = {
            title: correctResult.name,
            cover_url: correctResult.cover ? `https:${correctResult.cover.url.replace('t_thumb', 't_cover_big')}` : '',
            igdb_id: correctResult.id,
            summary: correctResult.summary,
            genres: correctResult.genres.map(g => g.name),
            platforms: correctResult.platforms.map(p => p.name),
            release_date: correctResult.first_release_date ? getDateFromIGDB(correctResult.first_release_date) : correctResult.first_release_date,
            start_date: game.start_date !== '' ? game.start_date : null,
            finish_date: game.finish_date !== '' ? game.finish_date : null,
            status: game.status,
            rating: correctResult.aggregated_rating ? Math.round(correctResult.aggregated_rating * 100) : 0,
            score: game.score,
            comments: game.comments,
            user: user.name
        }
        addGame(newGame)
            .then(res => setDisplayedGames([...displayedGames, res]))
    }

    const handleRowClick = (id) => {
        const pickedGame = displayedGames.find(g => g.id === id)
        if (!pickedGame) return
        setGameDetail(mapValuesForInput(pickedGame))
        setDetailShow(true)
    }

    const handleEdit = async (game) => {
        await updateGame(game)
        setDisplayedGames(displayedGames.map(g => g.id === game.id ? game : g))
    }

    const handleDelete = async () => {
        await deleteGame(gameDetail.id)
        setDetailShow(false)
        setAlertShow(false)
        setDisplayedGames(displayedGames.filter(g => g.id !== gameDetail.id))
    }

    const handleSortChange = (key) => {
        if (sortState.key === key) {
            setSortState({...sortState, direction: sortState.direction === 'asc' ? 'desc' : 'asc'})
            return
        }
        setSortState({key, direction: 'asc'})
    }

    const startedCount = displayedGames.filter(g => g.status === status.STARTED).length
    const completedCount = displayedGames.filter(g => g.status === status.COMPLETED).length
    const plannedCount = displayedGames.filter(g => g.status === status.PLANNED).length

    return (
        <>
            <main className={"app-shell"}>
                <div className={"app-frame"}>
                    <AppNavigation />

                    <section className={"panel overflow-hidden px-5 py-6 sm:px-7 lg:px-8"}>
                        <div className={"flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"}>
                            <div className={"max-w-3xl space-y-3"}>
                                <p className={"eyebrow"}>Personal Backlog</p>
                                <div className={"space-y-2"}>
                                    <h1 className={"text-4xl font-semibold sm:text-5xl"}>Track what you play without losing the thread.</h1>
                                    <p className={"muted max-w-2xl text-sm sm:text-base"}>
                                        Your library mixes IGDB metadata with HLTB time estimates. Sort the list the way you need, then jump into details or add the next game.
                                    </p>
                                </div>
                            </div>
                            <div className={"grid grid-cols-3 gap-3 sm:gap-4"}>
                                <div className={"panel-strong min-w-[92px] px-4 py-3 text-center"}>
                                    <p className={"eyebrow"}>Total</p>
                                    <p className={"mt-2 text-2xl font-semibold"}>{displayedGames.length}</p>
                                </div>
                                <div className={"panel-strong min-w-[92px] px-4 py-3 text-center"}>
                                    <p className={"eyebrow"}>Playing</p>
                                    <p className={"mt-2 text-2xl font-semibold"}>{startedCount}</p>
                                </div>
                                <div className={"panel-strong min-w-[92px] px-4 py-3 text-center"}>
                                    <p className={"eyebrow"}>Done</p>
                                    <p className={"mt-2 text-2xl font-semibold"}>{completedCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className={"mt-5 flex flex-wrap items-center gap-3 text-sm"}>
                            <span className={"status-pill bg-white/55 dark:bg-white/10"}>{plannedCount} planned</span>
                            <span className={"muted"}>Signed in as {user?.name}</span>
                        </div>
                    </section>

                    <div className={"grid gap-5 xl:grid-cols-[minmax(0,1.82fr)_minmax(300px,0.72fr)]"}>
                        <section className={"panel min-h-[60vh] px-4 py-4 sm:px-5 sm:py-5"}>
                            <div className={"mb-4 flex flex-col gap-4"}>
                                <div className={"flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"}>
                                    <div>
                                        <p className={"eyebrow"}>Library</p>
                                        <h2 className={"mt-1 text-2xl font-semibold"}>Your games</h2>
                                    </div>
                                    <p className={"muted text-sm"}>{data.length} visible entries</p>
                                </div>

                                <div className={"panel-strong flex flex-col gap-3 px-4 py-4 lg:hidden"}>
                                    <div className={"grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"}>
                                        <label className={"block"}>
                                            <span className={"mb-2 block text-sm font-semibold"}>Sort by</span>
                                            <select
                                                aria-label={"Mobile sort key"}
                                                className={"input-base"}
                                                value={sortState.key}
                                                onChange={(e) => setSortState({key: e.target.value, direction: 'asc'})}
                                            >
                                                {sortOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                                            </select>
                                        </label>
                                        <button
                                            type={"button"}
                                            className={"button-base button-secondary self-end"}
                                            onClick={() => setSortState({...sortState, direction: sortState.direction === 'asc' ? 'desc' : 'asc'})}
                                            aria-label={"Toggle mobile sort direction"}
                                        >
                                            {sortState.direction === 'asc' ? 'Ascending' : 'Descending'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={"hidden rounded-2xl border border-[rgb(var(--border)/0.6)] bg-[rgb(var(--surface-strong)/0.75)] px-4 py-3 text-sm font-semibold text-[rgb(var(--muted))] lg:grid lg:grid-cols-[112px_minmax(0,2.1fr)_100px_94px_72px_102px] lg:gap-3"}>
                                <span>Cover</span>
                                {sortOptions.map((option) => {
                                    const active = sortState.key === option.key
                                    const directionLabel = active ? (sortState.direction === 'asc' ? '↑' : '↓') : ''
                                    return (
                                        <button
                                            key={option.key}
                                            type={"button"}
                                            onClick={() => handleSortChange(option.key)}
                                            className={"flex items-center gap-2 text-left hover:text-[rgb(var(--foreground))]"}
                                            aria-label={`Sort by ${option.label}`}
                                        >
                                            <span>{option.label}</span>
                                            <span aria-hidden={"true"}>{directionLabel}</span>
                                        </button>
                                    )
                                })}
                            </div>

                            <div className={"scrollable mt-4 flex max-h-[calc(100vh-20rem)] flex-col gap-3 overflow-y-auto pr-1"}>
                                {data.map(g => (
                                    <button
                                        onClick={() => handleRowClick(g.id)}
                                        key={g.id}
                                        className={"panel-strong grid w-full gap-4 px-4 py-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[rgb(var(--border-strong))] hover:shadow-lg lg:grid-cols-[112px_minmax(0,2.1fr)_100px_94px_72px_102px] lg:items-center lg:gap-3"}
                                    >
                                        <div className={"overflow-hidden rounded-2xl bg-[rgb(var(--background))]"}>
                                            {g.cover_url
                                                ? <Image className={"aspect-[3/4] h-full w-full object-cover"} width={240} height={320} src={g.cover_url.replace('http:', 'https:')} alt={g.title}/>
                                                : <div className={"flex aspect-[3/4] items-center justify-center px-4 text-center text-sm muted"}>No cover</div>}
                                        </div>
                                        <div className={"min-w-0 space-y-2"}>
                                            <div className={"flex flex-wrap items-center gap-2"}>
                                                <h3 className={"max-w-full break-words text-[1.9rem] font-semibold leading-[1.08] whitespace-normal"}>{g.title}</h3>
                                                <span className={"muted text-sm"}>{getYear(g.release_date)}</span>
                                            </div>
                                            <p className={"muted line-clamp-2 text-sm"}>{g.summary || "No summary available."}</p>
                                            <div className={"flex flex-wrap gap-2 lg:hidden"}>
                                                <span className={"status-pill bg-white/55 dark:bg-white/10"}>{formatDisplayDate(g.start_date)}</span>
                                                <span className={`status-pill ${statusTone[g.status]}`}>{status.statusLabels[g.status]}</span>
                                                <span className={"status-pill bg-white/55 dark:bg-white/10"}>{g.time_to_beat?.[0] ?? 0}h main</span>
                                                <span className={"status-pill bg-white/55 dark:bg-white/10"}>{g.score ?? 0}/{g.rating ?? 0}</span>
                                            </div>
                                        </div>
                                        <div className={"hidden text-sm font-semibold lg:block"}>{formatDisplayDate(g.start_date)}</div>
                                        <div className={"hidden lg:block"}>
                                            <span className={`status-pill ${statusTone[g.status]}`}>{status.statusLabels[g.status]}</span>
                                        </div>
                                        <div className={"hidden text-sm font-semibold lg:block"}>{g.time_to_beat?.[0] ?? 0}h</div>
                                        <div className={"hidden text-sm font-semibold lg:block"}>{g.score ?? 0}/{g.rating ?? 0}</div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <div className={"xl:sticky xl:top-6 xl:self-start"}>
                            <GameSearch
                                filter={filter}
                                setFilter={setFilter}
                                search={search}
                                handleAdd={addNewGame}
                                searchResult={searchResult}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <GameDetailEdit
                handleDelete={() => setAlertShow(true)}
                game={gameDetail}
                setGame={setGameDetail}
                visible={detailShow}
                handleEdit={handleEdit}
                handleClose={() => setDetailShow(false)}
            />
            {alertShow && <Alert handleConfirm={handleDelete} handleCancel={() => setAlertShow(false)} gameTitle={gameDetail.title} />}
        </>
    )
}
