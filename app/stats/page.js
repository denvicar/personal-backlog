import {redirect} from "next/navigation";
import {auth} from "@/auth";
import {getGames} from "@/app/api/gameServer";
import BacklogStats from "@/app/components/backlogStats";

export default async function StatsPage() {
    const session = await auth()

    if (!session || !session.user) {
        redirect('/api/auth/signin')
    }

    const games = await getGames(session.user.name)

    return <BacklogStats games={games} user={session.user} />
}

export const dynamic = 'force-dynamic'
