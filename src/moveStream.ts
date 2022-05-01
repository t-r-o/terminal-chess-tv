import { Game } from './chessClient'
import { Decisive, GameResult, UIState } from './types'

export type Move = Required<Pick<UIState, 'fen' | 'mover' | 'lastMove'>> & { moveDelaySeconds: number }

export type GameStart = Pick<UIState, 'white' | 'black' | 'id'>

export type Next = GameStart | Move | GameResult

export function isGameStart (x: any): x is GameStart {
  return 'white' in x && 'black' in x && 'id' in x
}

export function isGameResult (x: any): x is GameResult {
  return 'winner' in x
}

export class MoveStream {
  private currentGame: Game | undefined
  private currentMove = 0
  nonTerminalStates = ['created', 'started']

  constructor (private readonly gameClient: { getGame(id?: string): Promise<Game> }) {}

  async next (): Promise<Next> {
    if (this.currentGame === undefined) {
      this.currentGame = await this.gameClient.getGame()
      return {
        white: {
          name: this.currentGame.white.name,
          rating: this.currentGame.white.rating,
          secondsRemaining: this.currentGame.totalTime,
          title: this.currentGame.white.title
        },
        black: {
          name: this.currentGame.black.name,
          rating: this.currentGame.black.rating,
          secondsRemaining: this.currentGame.totalTime,
          title: this.currentGame.black.title
        },
        id: this.currentGame.id
      }
    }
    if (this.currentMove < this.currentGame.moves.length) {
      // moves to play
      const move: Move = {
        fen: this.currentGame.moves[this.currentMove]!.fen,
        moveDelaySeconds: this.computeMoveWaitSeconds(this.currentGame, this.currentMove),
        mover: this.currentMove % 2 === 0 ? 'white' : 'black',
        lastMove: this.currentGame.moves[this.currentMove]!.lastMove
      }
      this.currentMove++
      return move
    } else if (this.isEndOfGame(this.currentGame)) {
      // all moves played and game has terminating status
      const gameEnd = determineGameResult(this.currentGame!)
      this.resetGame()
      return gameEnd
    } else {
      // all moves played but game has not terminated, refresh moves
      this.currentGame = await this.gameClient.getGame(this.currentGame.id)
      if (this.currentMove >= this.currentGame.moves.length) {
        // Edge case where we have caught up with the current game, unlikely to happen, skip to next game
        const gameEnd: GameResult = this.isEndOfGame(this.currentGame) ? determineGameResult(this.currentGame!) : { winner: 'unknown' }
        this.resetGame()
        return gameEnd
      } else {
        // Continue processing current game
        return this.next()
      }
    }
  }

  private computeMoveWaitSeconds (game: Game, moveNum: number): number {
    const lastTime = moveNum - 2 >= 0 ? game.moves[moveNum - 2]!.secondsRemaining : game.totalTime
    return lastTime - game.moves[moveNum]!.secondsRemaining
  }

  private isEndOfGame (game: Game): boolean {
    return !this.nonTerminalStates.includes(game.status)
  }

  private resetGame (): void {
    this.currentGame = undefined
    this.currentMove = 0
  }
}

export function determineGameResult ({ pgnHeader, status }: Game): GameResult {
  const resultHeader = pgnHeader['Result']
  if (resultHeader === '1-0') {
    return {
      winner: 'white',
      reason: determineWinningReason(status)
    }
  } else if (resultHeader === '0-1') {
    return {
      winner: 'black',
      reason: determineWinningReason(status)
    }
  } else if (resultHeader === '1/2-1/2') {
    return {
      winner: 'draw'
    }
  } else {
    return {
      winner: 'unknown'
    }
  }
}

function determineWinningReason (status: string): Decisive['reason'] {
  if (status === 'timeout' || status === 'outoftime') {
    return 'timeout'
  } else if (status === 'mate') {
    return 'checkmate'
  } else if (status === 'resign') {
    return 'resignation'
  } else {
    return 'unknown'
  }
}
