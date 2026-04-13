'use client'
import Image from "next/image";

export default function GameDetail({game, handleClose}) {
    if (!game) return null
    let rating = game.aggregated_rating ? game.aggregated_rating : 0
    rating = Math.round(rating * 100) / 100

    return (
        <div className={"modal-backdrop"} onClick={handleClose}>
            <div className={"panel scrollable relative z-50 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6"} onClick={(e) => e.stopPropagation()}>
                <div className={"mb-5 flex items-start justify-between gap-4"}>
                    <div>
                        <p className={"eyebrow"}>IGDB Preview</p>
                        <h2 className={"mt-1 text-3xl font-semibold"}>{game.name}</h2>
                    </div>
                    <button className={"button-base button-secondary px-3 py-2"} onClick={handleClose}>Close</button>
                </div>

                <div className={"grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]"}>
                    <div className={"overflow-hidden rounded-[24px] bg-[rgb(var(--background))]"}>
                        {game.cover && (
                            <Image
                                width={264}
                                height={352}
                                className={"h-full w-full object-cover"}
                                src={'https:' + game.cover.url.replace('t_thumb', 't_cover_big')}
                                alt={game.name}
                            />
                        )}
                    </div>
                    <div className={"space-y-4"}>
                        <div className={"grid gap-3 sm:grid-cols-2"}>
                            <div className={"panel-strong px-4 py-3"}>
                                <p className={"eyebrow"}>Genres</p>
                                <p className={"mt-2 text-sm"}>{game.genres && game.genres.map(g => g.name).join(", ").trim()}</p>
                            </div>
                            <div className={"panel-strong px-4 py-3"}>
                                <p className={"eyebrow"}>Platforms</p>
                                <p className={"mt-2 text-sm"}>{game.platforms && game.platforms.map(p => p.name).join(", ").trim()}</p>
                            </div>
                            <div className={"panel-strong px-4 py-3"}>
                                <p className={"eyebrow"}>Rating</p>
                                <p className={"mt-2 text-sm"}>{rating}</p>
                            </div>
                        </div>
                        <div className={"panel-strong px-4 py-4"}>
                            <p className={"eyebrow"}>Summary</p>
                            <p className={"mt-3 text-sm leading-6"}>{game.summary || "No summary available."}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
