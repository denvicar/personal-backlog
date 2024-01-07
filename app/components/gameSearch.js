'use client'

import {useState} from "react";

export default function GameSearch({searchResult,handleAdd,search}) {
    let [game, setGame] = useState({title:'',status:'PLAN',start_date:'',finish_date:'',score:null,comments:''})

    const resetInput = () => {
        setGame({title:'',status:'PLAN',start_date:'',finish_date:'',score:null,comments:''})
    }

    const add = (id) => {
        handleAdd(id,game)
        resetInput()
    }

    return (
        <div className={"flex flex-col gap-1 w-[35%] text-black h-svh flex-grow-0 pt-10 pb-2"}>
            <input type={"text"} placeholder={"Game title"} value={game.title} onChange={(e)=>setGame({...game,title:e.target.value})} />
            <select value={game.status} onChange={(e) => setGame({...game,status:e.target.value})}>
                <option value={"START"}>Started</option>
                <option value={"PLAN"}>Planned</option>
                <option value={"COMP"}>Completed</option>
                <option value={"DROP"}>Dropped</option>
            </select>
            <input type={"date"} placeholder={"Started on..."} value={game.start_date} onChange={(e)=>setGame({...game,start_date:e.target.value})} />
            <input type={"date"} placeholder={"Finished on..."} value={game.finish_date} onChange={(e)=>setGame({...game,finish_date:e.target.value})} />
            <input type={"number"} hidden={game.status!=='COMP'} placeholder={"Score"} value={game.score ? game.score : ''} onChange={(e)=>setGame({...game,score:e.target.value})} />
            <textarea hidden={game.status!=='COMP' && game.status!=='DROP'} placeholder={"Comments"} value={game.comments} onChange={(e)=>setGame({...game,comments:e.target.value})} />
            <input type={"submit"} value={"Search game"} className={"rounded dark:border-white border-2 border-black mb-5 dark:text-white"} onClick={()=>search(game.title)}/>
            <div className={"flex flex-col gap-1 h-full overflow-y-scroll dark:text-white pr-2"}>
                {searchResult.map(s => <div key={s.id} className={"flex flex-row gap-1 w-full items-center"}>
                    <img className={"w-[50%]"} src={`http:${s.cover.url.replace('t_thumb','t_cover_big')}`} />
                    <div className={"flex flex-col w-[50%] gap-2 items-center"}>
                        <div className={"text-sm"}>{s.name}</div>
                        <button className={"rounded dark:border-white border-2 border-black w-5/6"} onClick={()=>add(s.id)}>Add</button>
                    </div>
                </div>)}
            </div>
    </div>)
}