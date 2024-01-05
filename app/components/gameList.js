'use client'

export default function GameList({games}) {
    games = games.filter(g => g.user==='Ciro' && g.genres)

    const getYear = (ts) => {
        const d = new Date(ts*1000)
        return d.getFullYear();
    }
    return (
        <div className={"flex flex-col lg:w-5/12 justify-between gap-2 m-auto w-[90%]"}>
            <div className={"flex flex-row w-full gap-5 justify-around border-b-2 border-b-black dark:border-b-white"}>
                <div className={"lg:w-[15%] w-1/3"}><h1 className={"font-bold text-lg"}>Cover</h1></div>
                <div className={"lg:w-[33%] w-1/3"}><h1 className={"font-bold text-lg"}>Title</h1></div>
                <div className={"lg:w-[7%] w-1/3"}><h1 className={"font-bold text-lg"}>Status</h1></div>
            </div>
            {games.map(g => <div key={g.id} className={"flex flex-row w-full gap-5 justify-around"}>
                <img className={"lg:w-[15%] w-1/3"} src={g.cover_url} />
                <div className={"lg:w-[33%] w-1/3"}>{g.title} ({getYear(g.release_date)})</div>
                <div className={"lg:w-[7%] w-1/3"}>{g.status}</div>
            </div>)}
        </div>
    )
}