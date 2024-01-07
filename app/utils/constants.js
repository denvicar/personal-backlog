const COMPLETED = 'COMP'
const PLANNED = 'PLAN'
const STARTED = 'START'
const DROPPED = 'DROP'

const statusLabels = {
    'COMP': 'Completed',
    'PLAN': 'Planned',
    'START': 'Started',
    'DROP': 'Dropped'
}

export const status = {COMPLETED, PLANNED, STARTED, DROPPED, statusLabels}