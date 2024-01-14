import Image from 'next/image'
import {promises as fs} from 'fs'
import GameList from "@/app/components/gameList";
import GameDetailEdit from "@/app/components/gameDetailEdit";
import {getGames} from "@/app/api/gameServer";
import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {unstable_noStore} from "next/cache";
import {compareGames} from "@/app/utils/utils";

export default async function Home() {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/api/auth/signin')
  }
  let games = await getGames(session.user.name)

  return (
    // <GameList games={json} />
      <GameList games={games.sort(compareGames)} user={session.user} />
  )
}

export const dynamic = 'force-dynamic'


