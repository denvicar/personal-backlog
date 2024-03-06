'use client'
import Image from "next/image";

export default function GameDetail({game, handleClose}) {
    if (!game) return null
    let rating = game.aggregated_rating ? game.aggregated_rating : 0
    rating = Math.round(rating*100)/100
    return (
        <div className={"flex bg-white dark:bg-black flex-col gap-2 items-end lg:w-[40%] fixed top-[5%] left-[10%] lg:top-[15%] lg:left-[30%] lg:max-h-[70%] max-h-[90%] overflow-hidden p-8 border-2 dark:border-white border-black rounded-xl z-10 w-[80%]"}>
            <button className={"font-bold text-2xl"} onClick={handleClose}>x</button>
            <div className={"flex h-[90%] flex-col lg:flex-row gap-2 overflow-y-scroll"}>
                <div className={"w-[60%] lg:w-fit flex-shrink-0"}><Image width={264} height={352} src={game.cover && 'https:'+game.cover.url.replace('t_thumb','t_cover_big')} alt={game.name} /> </div>
                <div className={"flex flex-col w-fit overflow-y-scroll"}>
                    <div><span className={"font-bold"}>Title:</span> {game.name}</div>
                    <div><span className={"font-bold"}>Genres:</span> {game.genres && game.genres.map(g=>g.name).join(", ").trim()}</div>
                    <div><span className={"font-bold"}>Platforms:</span> {game.platforms && game.platforms.map(p=>p.name).join(", ").trim()}</div>
                    <div><span className={"font-bold"}>Rating:</span> {rating}</div>
                    <div><span className={"font-bold"}>Summary:</span> {game.summary}</div>
                </div>
            </div>
        </div>
    )
}