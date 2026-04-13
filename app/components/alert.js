'use client'
export default function Alert({handleConfirm, handleCancel, gameTitle}) {
    return (
        <div className={"modal-backdrop"} onClick={handleCancel}>
            <div className={"panel relative z-50 w-full max-w-md px-5 py-5 sm:px-6"} onClick={(e) => e.stopPropagation()}>
                <p className={"eyebrow"}>Delete Entry</p>
                <h2 className={"mt-2 text-2xl font-semibold"}>Remove this game?</h2>
                <p className={"muted mt-3 text-sm leading-6"}>
                    {gameTitle} will be removed from your backlog and its notes, dates, and score will be lost.
                </p>
                <div className={"mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"}>
                    <button className={"button-base button-secondary"} onClick={() => handleCancel()}>Cancel</button>
                    <button className={"button-base button-danger"} onClick={() => handleConfirm()}>Delete game</button>
                </div>
            </div>
        </div>
    )
}
