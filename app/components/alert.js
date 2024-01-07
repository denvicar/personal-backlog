'use client'
export default function Alert({handleConfirm, handleCancel, gameTitle}) {
    return (
        <div className={"z-20 absolute top-[30%] left-[42%] w-[16%] h-fit rounded-2xl px-7 py-2 dark:bg-black bg-white text-black dark:text-white border-2 dark:border-white border-black "}>
            <h1 className={"font-bold text-lg"}>Game deletion</h1>
            <p>Are you sure you want to delete {gameTitle} from the list?</p>
            <div className={"flex flex-row justify-evenly mt-2"}>
                <button className={"dark:bg-white bg-black dark:text-black text-white px-2 py-1 rounded hover:bg-gray-400 font-bold"} onClick={()=>handleConfirm()}>Confirm</button>
                <button className={"dark:bg-white bg-black dark:text-black text-white px-2 py-1 rounded hover:bg-gray-400 font-bold"} onClick={()=>handleCancel()}>Cancel</button>
            </div>
        </div>
    )
}