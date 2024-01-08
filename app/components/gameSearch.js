'use client'

import {useState} from "react";

export default function GameSearch({searchResult,handleAdd,search, filter, setFilter}) {
    let [game, setGame] = useState({title:'',status:'PLAN',start_date:'',finish_date:'',score:null,comments:''})

    const resetInput = () => {
        setGame({title:'',status:'PLAN',start_date:'',finish_date:'',score:null,comments:''})
    }

    const add = (id) => {
        handleAdd(id,game)
        resetInput()
    }

    const handleKeyPress = (e) => {
        if (e.key==='Enter') {
            search(game.title)
        }
    }

    return (
        <div className={"flex flex-col gap-1 w-[35%] text-black h-svh flex-grow-0 pt-5 pb-2"}>
            <input type={"text"} placeholder={"Filter list..."} className={"py-1 bg-gray-600 rounded-xl px-2 mb-2"} value={filter} onChange={(e) => setFilter(e.target.value)} />
            <input type={"text"} placeholder={"Game title"} onKeyDown={(e)=>handleKeyPress(e)} value={game.title} onChange={(e)=>setGame({...game,title:e.target.value})} />
            <select className={"py-0.5"} value={game.status} onChange={(e) => setGame({...game,status:e.target.value})}>
                <option value={"START"}>Started</option>
                <option value={"PLAN"}>Planned</option>
                <option value={"COMP"}>Completed</option>
                <option value={"DROP"}>Dropped</option>
            </select>
            <input className={"py-1"} type={"date"} placeholder={"Started on..."} value={game.start_date} onChange={(e)=>setGame({...game,start_date:e.target.value})} />
            <input className={"py-1"} type={"date"} placeholder={"Finished on..."} value={game.finish_date} onChange={(e)=>setGame({...game,finish_date:e.target.value})} />
            <input type={"number"} hidden={game.status!=='COMP'} placeholder={"Score"} value={game.score ? game.score : ''} onChange={(e)=>setGame({...game,score:e.target.value})} />
            <textarea hidden={game.status!=='COMP' && game.status!=='DROP'} placeholder={"Comments"} value={game.comments} onChange={(e)=>setGame({...game,comments:e.target.value})} />
            <button className={"rounded dark:border-white border-2 border-black mb-5 dark:text-white"} onClick={()=>search(game.title)}>Search game</button>
            <div className={"flex flex-col gap-1 h-full overflow-y-scroll dark:text-white pr-2"}>
                {searchResult.map(s => <div key={s.id} className={"flex flex-row gap-1 w-full items-center"}>
                    {s.cover && <img className={"w-[50%]"} src={`http:${s.cover.url.replace('t_thumb','t_cover_big')}`} />}
                    <div className={"flex flex-col w-[50%] gap-2 items-center"}>
                        <div className={"text-sm"}>{s.name}</div>
                        <button className={"rounded dark:border-white border-2 border-black w-5/6"} onClick={()=>add(s.id)}>Add</button>
                    </div>
                </div>)}
            </div>
    </div>)
}