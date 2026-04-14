// @vitest-environment jsdom

import {render, screen} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'

import BacklogStats from '@/app/components/backlogStats'
import {status} from '@/app/utils/constants'

vi.mock('next/image', () => ({
    default: (props) => <img {...props} alt={props.alt} />,
}))

vi.mock('next/navigation', () => ({
    usePathname: () => '/stats',
}))

describe('BacklogStats', () => {
    it('renders populated stats sections', () => {
        render(
            <BacklogStats
                user={{name: 'ciro'}}
                games={[
                    {id: 1, title: 'Animal Well', cover_url: '', summary: 'Puzzle box', status: status.COMPLETED, finish_date: '2024-05-12', genres: ['Puzzle'], time_to_beat: [8.5], score: 9},
                    {id: 3, title: 'Celeste', cover_url: '', summary: 'Platformer', status: status.COMPLETED, finish_date: '2025-01-01', genres: ['Platformer'], time_to_beat: [], score: 7},
                    {id: 2, title: 'Balatro', cover_url: '', summary: 'Card roguelike', status: status.PLANNED, finish_date: null, genres: ['Card'], time_to_beat: [12]},
                ]}
            />
        )

        expect(screen.getByRole('heading', {name: 'Games completed by year'})).toBeInTheDocument()
        expect(screen.getByText('Puzzle')).toBeInTheDocument()
        expect(screen.getByRole('heading', {name: 'Five random planned games'})).toBeInTheDocument()
        expect(screen.getByText('Balatro')).toBeInTheDocument()
        expect(screen.getByText('Average Rating')).toBeInTheDocument()
        expect(screen.getByText('8')).toBeInTheDocument()
        expect(screen.getByText('Animal Well')).toBeInTheDocument()
        expect(screen.getByText('Celeste')).toBeInTheDocument()
    })

    it('shows friendly empty states when data is missing', () => {
        render(
            <BacklogStats
                user={{name: 'ciro'}}
                games={[
                    {id: 1, title: 'Portal', cover_url: '', summary: '', status: status.STARTED, finish_date: null, genres: [], time_to_beat: []},
                ]}
            />
        )

        expect(screen.getByText('No completed games with a finish date yet.')).toBeInTheDocument()
        expect(screen.getByText('Played hours are shown in parentheses when HLTB data is available for completed entries.')).toBeInTheDocument()
        expect(screen.getAllByText('No genre data available.').length).toBeGreaterThan(0)
        expect(screen.getByText('No completed games with an assigned rating yet.')).toBeInTheDocument()
        expect(screen.getByText('No planned games available.')).toBeInTheDocument()
    })
})
