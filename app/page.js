import Image from 'next/image'
import {promises as fs} from 'fs'
import GameList from "@/app/components/gameList";

export default async function Home() {
  const file = await fs.readFile(process.cwd() + '/app/db.json','utf8')
  const json = JSON.parse(file)

  return (
    <GameList games={json} />
  )
}
