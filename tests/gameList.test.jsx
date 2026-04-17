// @vitest-environment jsdom

import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'

import GameList from '@/app/components/gameList'
import {addGame, searchGame} from '@/app/api/gameServer'
import {status} from '@/app/utils/constants'

vi.mock('next/image', () => ({
    default: (props) => <img {...props} alt={props.alt} />,
}))

vi.mock('next/navigation', () => ({
    usePathname: () => '/',
}))

vi.mock('@/app/api/gameServer', () => ({
    searchGame: vi.fn().mockResolvedValue([]),
    addGame: vi.fn(),
    updateGame: vi.fn(),
    deleteGame: vi.fn(),
}))

vi.mock('@/app/components/gameSearch', () => ({
    default: function MockGameSearch({filter, setFilter, search, handleAdd, searchResult}) {
        return (
            <aside>
                <label htmlFor={"filter-input"}>Filter your backlog</label>
                <input id={"filter-input"} value={filter} onChange={(event) => setFilter(event.target.value)} />
                <button onClick={() => search('Balatro')}>Search game</button>
                {searchResult.map((result) => (
                    <button key={result.id} onClick={() => handleAdd(result.id, {status: 'PLAN', start_date: '', finish_date: '', score: null, comments: ''})}>
                        Add {result.name}
                    </button>
                ))}
            </aside>
        )
    }
}))

vi.mock('@/app/components/gameDetailEdit', () => ({
    default: function MockGameDetailEdit() {
        return null
    }
}))

vi.mock('@/app/components/alert', () => ({
    default: function MockAlert() {
        return null
    }
}))

describe('GameList sorting', () => {
    const games = [
        {id: 1, title: 'Zelda', cover_url: '', summary: 'Adventure', release_date: '2023-05-01', start_date: '2024-03-01', status: status.STARTED, time_to_beat: [30], rating: 92, score: null},
        {id: 2, title: 'Animal Well', cover_url: '', summary: 'Puzzle', release_date: '2024-05-01', start_date: null, status: status.PLANNED, time_to_beat: [], rating: 95, score: null},
        {id: 3, title: 'Balatro', cover_url: '', summary: 'Cards', release_date: '2024-02-01', start_date: '2024-01-20', status: status.COMPLETED, time_to_beat: [12], rating: 89, score: 10},
    ]

    const getRenderedTitles = () => {
        const headings = screen.getAllByRole('heading', {level: 3})
        return headings.map((heading) => heading.textContent)
    }

    it('defaults to status order and toggles desktop column sorting', async () => {
        const user = userEvent.setup()
        render(<GameList games={games} user={{name: 'ciro'}} />)

        expect(getRenderedTitles()).toEqual(['Zelda', 'Animal Well', 'Balatro'])

        await user.click(screen.getByRole('button', {name: 'Sort by Title'}))
        expect(getRenderedTitles()).toEqual(['Animal Well', 'Balatro', 'Zelda'])

        await user.click(screen.getByRole('button', {name: 'Sort by Title'}))
        expect(getRenderedTitles()).toEqual(['Zelda', 'Balatro', 'Animal Well'])
    })

    it('uses the mobile sort controls and applies sorting after filtering', async () => {
        const user = userEvent.setup()
        render(<GameList games={games} user={{name: 'ciro'}} />)

        await user.type(screen.getByLabelText('Filter your backlog'), 'a')
        expect(getRenderedTitles()).toEqual(['Zelda', 'Animal Well', 'Balatro'])

        await user.selectOptions(screen.getByLabelText('Mobile sort key'), 'hours')
        expect(getRenderedTitles()).toEqual(['Balatro', 'Zelda', 'Animal Well'])

        await user.click(screen.getByRole('button', {name: 'Toggle mobile sort direction'}))
        expect(getRenderedTitles()).toEqual(['Animal Well', 'Zelda', 'Balatro'])
    })

    it('does not append a failed add response to the backlog', async () => {
        const user = userEvent.setup()
        searchGame.mockResolvedValue([{id: 9, name: 'Balatro', genres: [], platforms: []}])
        addGame.mockResolvedValue({status: 500, message: 'Database error'})

        render(<GameList games={games} user={{name: 'ciro'}} />)

        await user.click(screen.getByRole('button', {name: 'Search game'}))
        await user.click(screen.getByRole('button', {name: 'Add Balatro'}))

        expect(screen.getAllByRole('heading', {level: 3})).toHaveLength(3)
    })
})
