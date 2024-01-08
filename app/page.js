import Image from 'next/image'
import {promises as fs} from 'fs'
import GameList from "@/app/components/gameList";
import GameDetail from "@/app/components/gameDetail";
import {getGames} from "@/app/api/gameServer";
import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {unstable_noStore} from "next/cache";

export default async function Home() {
  const games = await getGames()
  const session = await auth()

  if (!session || !session.user) {
    redirect('/api/auth/signin')
  }

  return (
    // <GameList games={json} />
      <GameList games={games.filter(g=>g.user===user.name)} />
  )
}
