/*
    Core types
*/
export type PlayerColours = 'white' | 'black'

export type Player = {
    name: string
    rating: number
    title?: string
    secondsRemaining: number
}

export type NonDecisive = {
    winner: 'draw' | 'unknown'
}

export type Decisive = {
    winner: PlayerColours
    reason: 'checkmate' | 'timeout' | 'resignation' | 'unknown'
}

export type GameResult = Decisive | NonDecisive

export type UIState = {
    fen: string
    lastMove?: { from: string, to: string }
    white: Player
    black: Player
    result?: GameResult
    mover: PlayerColours
    id: string
}

export type AppConfig = {
    isFullscreen: boolean
    enableLogging: boolean
    useMockedGames: boolean
}
