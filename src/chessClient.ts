import fs from 'fs'
import axios from 'axios'
import { Chess } from 'chess.js'
import { zipMap } from './utils'

export type Game = {
    id: string
    totalTime: number
    status: string
    moves: { fen: string, secondsRemaining: number, lastMove: { from: string, to: string } }[]
    white: {
        name: string
        rating: number
        title?: string
    },
    black: {
        name: string
        rating: number
        title?: string
    },
    pgnHeader: { [key: string]: string | undefined }
}

export type LichessGame = {
    id: string
    pgn: string
    moves: string
    status: string
    clock: {
        initial: number
        increment: number
        totalTime: number
    }
    players: {
        white: {
            user: {
                name: string
                title?: string
            },
            rating: number
        },
        black: {
            user: {
                name: string,
                title?: string
            },
            rating: number
        },
    }
}

export async function getGame (id?: string): Promise<Game> {
  if (id === undefined) {
    const resp = await axios({
      url: 'https://lichess.org/api/tv/blitz',
      headers: { Accept: 'application/x-ndjson' },
      params: {
        nb: 30,
        pgnInJson: true,
        clocks: true
      }
    })

    const games = extractGames(resp.data).filter(isValidGame)
    const selected = chooseGame(games)
    return convert(selected)
  } else {
    const resp = await axios({
      url: `https://lichess.org/game/export/${id}`,
      headers: {
        Accept: 'application/json'
      },
      params: {
        pgnInJson: true,
        clocks: true
      }
    })
    return convert(resp.data)
  }
}

function isValidGame (game: LichessGame): boolean {
  // Filter out games that are:
  // - increment
  // - beserked (or might be beserked, i.e. if less than 2 moves)
  if (game.clock.increment !== 0) {
    return false
  }
  const chess = new Chess()
  chess.load_pgn(game.pgn)
  const whiteComment = chess.get_comments()[0]?.comment
  const blackComment = chess.get_comments()[1]?.comment
  if (whiteComment === undefined || blackComment === undefined) {
    return false
  }
  return parseTimeRemaining(whiteComment) === game.clock.totalTime && parseTimeRemaining(blackComment) === game.clock.totalTime
}

function convert (lichessGame: LichessGame): Game {
  const chess = new Chess()
  const loaded = chess.load_pgn(lichessGame.pgn)
  if (!loaded) {
    throw new Error('Failed to load pgn')
  }
  const moves = zipMap(chess.get_comments(), chess.history({ verbose: true }), (commentEl, historyEl) => {
    return {
      fen: commentEl.fen,
      secondsRemaining: parseTimeRemaining(commentEl.comment),
      lastMove: {
        from: historyEl.from,
        to: historyEl.to
      }
    }
  })
  return {
    id: lichessGame.id,
    moves,
    totalTime: lichessGame.clock.initial,
    status: lichessGame.status,
    white: {
      name: lichessGame.players.white.user.name,
      rating: lichessGame.players.white.rating,
      title: lichessGame.players.white.user.title
    },
    black: {
      name: lichessGame.players.black.user.name,
      rating: lichessGame.players.black.rating,
      title: lichessGame.players.black.user.title
    },
    pgnHeader: chess.header()
  }
}

const timeRegex = /\[%clk \d:(?<time>\d\d:\d\d)\]/

export function parseTimeRemaining (timeComment: string): number {
  const regexResult = timeComment.match(timeRegex)
  if (regexResult?.groups !== undefined && regexResult.groups['time'] !== undefined) {
    return convertToSeconds(regexResult.groups['time'])
  } else {
    throw new Error('Could not parse time')
  }
}

export function convertToSeconds (clockStr: string): number {
  return parseInt(clockStr.charAt(0)) * 10 * 60 +
            parseInt(clockStr.charAt(1)) * 60 +
            parseInt(clockStr.charAt(3)) * 10 +
            parseInt(clockStr.charAt(4))
}

export function timeUsedPercent (game: LichessGame): number {
  const chess = new Chess()
  chess.load_pgn(game.pgn)
  const comments = chess.get_comments()
  const last = comments[comments.length - 1]
  const secondToLast = comments[comments.length - 2]
  const lastTime = last === undefined ? 0 : game.clock.totalTime - parseTimeRemaining(last.comment)
  const secondToLastTime = secondToLast === undefined ? 0 : game.clock.totalTime - parseTimeRemaining(secondToLast.comment)
  const used = lastTime + secondToLastTime
  const total = game.clock.totalTime * 2
  return Math.floor(used / total * 100)
}

export function chooseGame (games: LichessGame[]): LichessGame {
  const result = games.reduce<LichessGame | undefined>((chosen, curr) => {
    if (chosen === undefined) {
      return curr
    }

    if (isTerminatedGame(chosen)) {
      return chosen
    }

    if (isTerminatedGame(curr)) {
      return curr
    } else {
      // choose game with highest time % used
      const currUsedPercent = timeUsedPercent(curr)
      const chosenUsedPercent = timeUsedPercent(chosen)
      return currUsedPercent > chosenUsedPercent ? curr : chosen
    }
  }, undefined)

  if (result === undefined) {
    throw new Error("Can't find a game that fits the selection criteria")
  }
  return result
}

const terminationStates = ['mate', 'resign', 'stalemate', 'timeout', 'draw', 'outoftime']
function isTerminatedGame (game: LichessGame): boolean {
  return terminationStates.includes(game.status)
}

function extractGames (responseStr: string): LichessGame[] {
  const gameLines = responseStr.split('\n')
  return gameLines.slice(0, gameLines.length - 1).map(g => JSON.parse(g))
}

const mockGamesPath = './resources/mockGames.json'
// Stateful mock client that loads games from a file
export class MockClient {
  private games: Game[]
  private currentGame

  constructor () {
    this.games = []
    this.currentGame = 0
  }

  async getGame (id?: string): Promise<Game> {
    if (id !== undefined) {
      return Promise.reject(new Error('Mock client does not implement queries by id'))
    }
    if (this.games.length === 0) {
      // Load games
      this.games = await this.loadGames()
    }
    if (this.currentGame === this.games.length) {
      // reset and loop
      this.currentGame = 0
    }

    const currentGame = this.games[this.currentGame]
    this.currentGame++
    if (currentGame === undefined) {
      throw new Error('Mock client is misconfigured, no games available')
    }
    return currentGame
  }

  async loadGames (): Promise<Array<Game>> {
    const file = await fs.promises.readFile(mockGamesPath, 'utf-8')
    return new Promise((resolve) => {
      // realism when producing GIF of terminal
      setTimeout(resolve, 400)
    }).then(() => extractGames(file).map(convert))
  }
}
