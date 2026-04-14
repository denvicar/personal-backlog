import Image from "next/image";
import AppNavigation from "@/app/components/appNavigation";
import {getBacklogStats} from "@/app/utils/utils";
import {status} from "@/app/utils/constants";

const statusTone = {
    [status.STARTED]: "bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100",
    [status.PLANNED]: "bg-sky-200/75 text-sky-900 dark:bg-sky-900/45 dark:text-sky-100",
    [status.COMPLETED]: "bg-amber-200/75 text-amber-900 dark:bg-amber-900/45 dark:text-amber-100",
    [status.DROPPED]: "bg-rose-200/75 text-rose-900 dark:bg-rose-950/45 dark:text-rose-100",
}

const BarList = ({items, labelKey, valueKey, emptyLabel, suffix = '', renderValue}) => {
    if (items.length === 0) {
        return <p className={"muted text-sm"}>{emptyLabel}</p>
    }

    const maxValue = Math.max(...items.map((item) => item[valueKey]), 1)

    return (
        <div className={"space-y-3"}>
            {items.map((item) => (
                <div key={item[labelKey]} className={"space-y-1.5"}>
                    <div className={"flex items-center justify-between gap-3 text-sm"}>
                        <span className={"font-semibold"}>{item[labelKey]}</span>
                        <span className={"muted"}>{renderValue ? renderValue(item) : `${item[valueKey]}${suffix}`}</span>
                    </div>
                    <div className={"h-2.5 rounded-full bg-[rgb(var(--background))]"}>
                        <div
                            className={"h-full rounded-full bg-[rgb(var(--accent))]"}
                            style={{width: `${Math.max((item[valueKey] / maxValue) * 100, 8)}%`}}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

const mergeYearlyStats = (completedByYear, hoursByYear) => {
    const hourMap = new Map(hoursByYear.map((item) => [item.year, item.hours]))
    return completedByYear.map((item) => ({
        year: item.year,
        count: item.count,
        hours: hourMap.get(item.year) ?? 0,
    }))
}

export default function BacklogStats({games, user}) {
    const stats = getBacklogStats(games)
    const yearlyCompletionStats = mergeYearlyStats(stats.gamesCompletedByYear, stats.totalTimeSpentByYear)

    return (
        <main className={"app-shell"}>
            <div className={"app-frame"}>
                <AppNavigation />

                <section className={"panel overflow-hidden px-5 py-6 sm:px-7 lg:px-8"}>
                    <div className={"flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"}>
                        <div className={"max-w-3xl space-y-3"}>
                            <p className={"eyebrow"}>Analytics</p>
                            <div className={"space-y-2"}>
                                <h1 className={"text-4xl font-semibold sm:text-5xl"}>See how the backlog is evolving.</h1>
                                <p className={"muted max-w-2xl text-sm sm:text-base"}>
                                    This page summarizes completion trends, genre preferences, and estimated time invested from the HLTB data already stored in your library.
                                </p>
                            </div>
                        </div>
                        <p className={"muted text-sm"}>Signed in as {user?.name}</p>
                    </div>

                    <div className={"mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"}>
                        <div className={"panel-strong px-4 py-4"}>
                            <p className={"eyebrow"}>Total Games</p>
                            <p className={"mt-2 text-3xl font-semibold"}>{stats.summary.totalGames}</p>
                        </div>
                        <div className={"panel-strong px-4 py-4"}>
                            <p className={"eyebrow"}>Completed</p>
                            <p className={"mt-2 text-3xl font-semibold"}>{stats.summary.completedGames}</p>
                        </div>
                        <div className={"panel-strong px-4 py-4"}>
                            <p className={"eyebrow"}>Planned</p>
                            <p className={"mt-2 text-3xl font-semibold"}>{stats.summary.plannedGames}</p>
                        </div>
                        <div className={"panel-strong px-4 py-4"}>
                            <p className={"eyebrow"}>Known HLTB Hours</p>
                            <p className={"mt-2 text-3xl font-semibold"}>{stats.summary.totalKnownHours}h</p>
                        </div>
                    </div>
                </section>

                <div className={"grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"}>
                    <section className={"panel px-5 py-5 sm:px-6"}>
                        <div className={"space-y-4"}>
                            <div>
                                <p className={"eyebrow"}>Yearly Completions</p>
                                <h2 className={"mt-1 text-2xl font-semibold"}>Games completed by year</h2>
                                <p className={"muted mt-2 text-sm"}>Played hours are shown in parentheses when HLTB data is available for completed entries.</p>
                            </div>
                            <BarList
                                items={yearlyCompletionStats}
                                labelKey={"year"}
                                valueKey={"count"}
                                emptyLabel={"No completed games with a finish date yet."}
                                renderValue={(item) => `${item.count} (${item.hours}h)`}
                            />
                        </div>
                    </section>

                    <section className={"panel px-5 py-5 sm:px-6"}>
                        <div className={"space-y-5"}>
                            <div>
                                <p className={"eyebrow"}>Genre Insights</p>
                                <h2 className={"mt-1 text-2xl font-semibold"}>Most played genre</h2>
                            </div>
                            {stats.topGenre ? (
                                <div className={"panel-strong px-4 py-4"}>
                                    <p className={"text-3xl font-semibold"}>{stats.topGenre.genre}</p>
                                    <p className={"muted mt-2 text-sm"}>{stats.topGenre.count} entries in your backlog</p>
                                </div>
                            ) : (
                                <p className={"muted text-sm"}>No genre data available.</p>
                            )}

                            <BarList
                                items={stats.genreBreakdown.slice(0, 6)}
                                labelKey={"genre"}
                                valueKey={"count"}
                                emptyLabel={"No genre data available."}
                            />

                            <div className={"border-t border-[rgb(var(--border)/0.6)] pt-5"}>
                                <p className={"eyebrow"}>Ratings</p>
                                <h3 className={"mt-1 text-xl font-semibold"}>Score and rating breakdown</h3>

                                <div className={"mt-4 grid gap-4"}>
                                    <div className={"panel-strong px-4 py-4"}>
                                        <p className={"eyebrow"}>Completed Scores</p>
                                        <h4 className={"mt-1 text-lg font-semibold"}>Assigned user scores on completed games</h4>
                                        {stats.scoreStats.averageScore === null ? (
                                            <p className={"muted mt-3 text-sm"}>No completed games with an assigned score yet.</p>
                                        ) : (
                                            <div className={"mt-4 grid gap-3"}>
                                                <div>
                                                    <p className={"eyebrow"}>Average Score</p>
                                                    <p className={"mt-2 text-3xl font-semibold"}>{stats.scoreStats.averageScore}</p>
                                                </div>
                                                <div className={"grid gap-3 sm:grid-cols-2"}>
                                                    <div>
                                                        <p className={"eyebrow"}>Highest Score</p>
                                                        <p className={"mt-2 text-lg font-semibold"}>{stats.scoreStats.highestScore?.title}</p>
                                                        <p className={"muted mt-1 text-sm"}>{stats.scoreStats.highestScore?.value}</p>
                                                    </div>
                                                    <div>
                                                        <p className={"eyebrow"}>Lowest Score</p>
                                                        <p className={"mt-2 text-lg font-semibold"}>{stats.scoreStats.lowestScore?.title}</p>
                                                        <p className={"muted mt-1 text-sm"}>{stats.scoreStats.lowestScore?.value}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={"panel-strong px-4 py-4"}>
                                        <p className={"eyebrow"}>Completed Ratings</p>
                                        <h4 className={"mt-1 text-lg font-semibold"}>IGDB ratings for completed games</h4>
                                        {stats.completedRatingStats.averageRating === null ? (
                                            <p className={"muted mt-3 text-sm"}>No completed games with an IGDB rating yet.</p>
                                        ) : (
                                            <div className={"mt-4 grid gap-3"}>
                                                <div>
                                                    <p className={"eyebrow"}>Average Rating</p>
                                                    <p className={"mt-2 text-3xl font-semibold"}>{stats.completedRatingStats.averageRating}</p>
                                                </div>
                                                <div className={"grid gap-3 sm:grid-cols-2"}>
                                                    <div>
                                                        <p className={"eyebrow"}>Highest Rating</p>
                                                        <p className={"mt-2 text-lg font-semibold"}>{stats.completedRatingStats.highestRating?.title}</p>
                                                        <p className={"muted mt-1 text-sm"}>{stats.completedRatingStats.highestRating?.value}</p>
                                                    </div>
                                                    <div>
                                                        <p className={"eyebrow"}>Lowest Rating</p>
                                                        <p className={"mt-2 text-lg font-semibold"}>{stats.completedRatingStats.lowestRating?.title}</p>
                                                        <p className={"muted mt-1 text-sm"}>{stats.completedRatingStats.lowestRating?.value}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={"panel-strong px-4 py-4"}>
                                        <p className={"eyebrow"}>Backlog Ratings</p>
                                        <h4 className={"mt-1 text-lg font-semibold"}>IGDB ratings across the full backlog</h4>
                                        {stats.backlogRatingStats.averageRating === null ? (
                                            <p className={"muted mt-3 text-sm"}>No backlog games with an IGDB rating yet.</p>
                                        ) : (
                                            <div className={"mt-4 grid gap-3"}>
                                                <div>
                                                    <p className={"eyebrow"}>Average Rating</p>
                                                    <p className={"mt-2 text-3xl font-semibold"}>{stats.backlogRatingStats.averageRating}</p>
                                                </div>
                                                <div className={"grid gap-3 sm:grid-cols-2"}>
                                                    <div>
                                                        <p className={"eyebrow"}>Highest Rating</p>
                                                        <p className={"mt-2 text-lg font-semibold"}>{stats.backlogRatingStats.highestRating?.title}</p>
                                                        <p className={"muted mt-1 text-sm"}>{stats.backlogRatingStats.highestRating?.value}</p>
                                                    </div>
                                                    <div>
                                                        <p className={"eyebrow"}>Lowest Rating</p>
                                                        <p className={"mt-2 text-lg font-semibold"}>{stats.backlogRatingStats.lowestRating?.title}</p>
                                                        <p className={"muted mt-1 text-sm"}>{stats.backlogRatingStats.lowestRating?.value}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <section className={"panel px-5 py-5 sm:px-6"}>
                    <div className={"mb-5 flex items-center justify-between gap-3"}>
                        <div>
                            <p className={"eyebrow"}>Start One Of These</p>
                            <h2 className={"mt-1 text-2xl font-semibold"}>Five random planned games</h2>
                        </div>
                        <p className={"muted text-sm"}>{stats.randomPlannedGames.length} suggestions</p>
                    </div>

                    {stats.randomPlannedGames.length === 0 ? (
                        <p className={"muted text-sm"}>No planned games available.</p>
                    ) : (
                        <div className={"grid gap-4 sm:grid-cols-2 xl:grid-cols-5"}>
                            {stats.randomPlannedGames.map((game) => (
                                <article key={game.id} className={"panel-strong overflow-hidden px-4 py-4"}>
                                    <div className={"overflow-hidden rounded-[20px] bg-[rgb(var(--background))]"}>
                                        {game.cover_url
                                            ? <Image className={"aspect-[3/4] h-full w-full object-cover"} width={240} height={320} src={game.cover_url.replace('http:', 'https:')} alt={game.title}/>
                                            : <div className={"flex aspect-[3/4] items-center justify-center px-4 text-center text-sm muted"}>No cover</div>}
                                    </div>
                                    <div className={"mt-4 space-y-3"}>
                                        <h3 className={"text-lg font-semibold"}>{game.title}</h3>
                                        <div className={"flex flex-wrap gap-2"}>
                                            <span className={`status-pill ${statusTone[game.status]}`}>{status.statusLabels[game.status]}</span>
                                            <span className={"status-pill bg-white/55 dark:bg-white/10"}>{game.time_to_beat?.[0] ?? 0}h main</span>
                                        </div>
                                        <p className={"muted line-clamp-3 text-sm"}>{game.summary || "No summary available."}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}
