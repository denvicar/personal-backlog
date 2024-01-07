import Image from 'next/image'
import {promises as fs} from 'fs'
import GameList from "@/app/components/gameList";
import GameDetail from "@/app/components/gameDetail";
import {getGames} from "@/app/api/gameServer";

export default async function Home() {
  const games = await getGames()

  return (
    // <GameList games={json} />
      <GameList games={games} />
  )
}
