import { when } from 'jest-when'
import { Game } from '../src/chessClient'
import { MoveStream } from '../src/moveStream'

test('moveStream', async () => {
  const game1: Game = {
    id: 'game1',
    totalTime: 180,
    status: 'timeout',
    moves: [
      { fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', lastMove: { from: 'e2', to: 'e4' }, secondsRemaining: 180 },
      { fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', lastMove: { from: 'e7', to: 'e5' }, secondsRemaining: 180 },
      { fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', lastMove: { from: 'g1', to: 'f3' }, secondsRemaining: 178 },
      { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', lastMove: { from: 'b8', to: 'c6' }, secondsRemaining: 175 }
    ],
    white: {
      name: 'g1w',
      rating: 2500
    },
    black: {
      name: 'g1b',
      rating: 2600,
      title: 'FM'
    },
    pgnHeader: {
      Result: '0-1'
    }
  }
  const game2: Game = {
    id: 'game2',
    totalTime: 180,
    status: 'started',
    moves: [
      { fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', lastMove: { from: 'e2', to: 'e4' }, secondsRemaining: 180 },
      { fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', lastMove: { from: 'e7', to: 'e5' }, secondsRemaining: 177 },
      { fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', lastMove: { from: 'g1', to: 'f3' }, secondsRemaining: 179 },
      { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', lastMove: { from: 'b8', to: 'c6' }, secondsRemaining: 173 },
      { fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', lastMove: { from: 'f1', to: 'b5' }, secondsRemaining: 170 }
    ],
    white: {
      name: 'g2w',
      rating: 2500,
      title: 'NM'
    },
    black: {
      name: 'g2b',
      rating: 2800,
      title: 'GM'
    },
    pgnHeader: {}
  }
  const game2continued: Game = {
    id: 'game2',
    totalTime: 180,
    status: 'resign',
    moves: [
      { fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', lastMove: { from: 'e2', to: 'e4' }, secondsRemaining: 180 },
      { fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', lastMove: { from: 'e7', to: 'e5' }, secondsRemaining: 177 },
      { fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', lastMove: { from: 'g1', to: 'f3' }, secondsRemaining: 179 },
      { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', lastMove: { from: 'b8', to: 'c6' }, secondsRemaining: 173 },
      { fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', lastMove: { from: 'f1', to: 'b5' }, secondsRemaining: 170 },
      { fen: 'r1bqkbnr/pppp1ppp/8/1B2p3/3nP3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', lastMove: { from: 'c6', to: 'd4' }, secondsRemaining: 168 }
    ],
    white: {
      name: 'g2w',
      rating: 2500,
      title: 'NM'
    },
    black: {
      name: 'g2b',
      rating: 2800,
      title: 'GM'
    },
    pgnHeader: {
      Result: '1-0'
    }
  }

  const mockChessClient = jest.fn()
  when(mockChessClient).calledWith().mockResolvedValueOnce(game1)
    .mockResolvedValueOnce(game2)
  when(mockChessClient).calledWith('game2').mockResolvedValueOnce(game2continued)

  const moveStream = new MoveStream({ getGame: mockChessClient })

  // game1
  expect(await moveStream.next()).toEqual({ id: 'game1', white: { name: 'g1w', rating: 2500, secondsRemaining: 180 }, black: { name: 'g1b', rating: 2600, secondsRemaining: 180, title: 'FM' } })
  expect(await moveStream.next()).toEqual({ fen: game1.moves[0]!.fen, mover: 'white', lastMove: game1.moves[0]!.lastMove, moveDelaySeconds: 0 })
  expect(await moveStream.next()).toEqual({ fen: game1.moves[1]!.fen, mover: 'black', lastMove: game1.moves[1]!.lastMove, moveDelaySeconds: 0 })
  expect(await moveStream.next()).toEqual({ fen: game1.moves[2]!.fen, mover: 'white', lastMove: game1.moves[2]!.lastMove, moveDelaySeconds: 2 })
  expect(await moveStream.next()).toEqual({ fen: game1.moves[3]!.fen, mover: 'black', lastMove: game1.moves[3]!.lastMove, moveDelaySeconds: 5 })
  expect(await moveStream.next()).toEqual({ winner: 'black', reason: 'timeout' })

  // game2
  expect(await moveStream.next()).toEqual({ id: 'game2', white: { name: 'g2w', rating: 2500, secondsRemaining: 180, title: 'NM' }, black: { name: 'g2b', rating: 2800, secondsRemaining: 180, title: 'GM' } })
  expect(await moveStream.next()).toEqual({ fen: game2.moves[0]!.fen, mover: 'white', lastMove: game2.moves[0]!.lastMove, moveDelaySeconds: 0 })
  expect(await moveStream.next()).toEqual({ fen: game2.moves[1]!.fen, mover: 'black', lastMove: game2.moves[1]!.lastMove, moveDelaySeconds: 3 })
  expect(await moveStream.next()).toEqual({ fen: game2.moves[2]!.fen, mover: 'white', lastMove: game2.moves[2]!.lastMove, moveDelaySeconds: 1 })
  expect(await moveStream.next()).toEqual({ fen: game2.moves[3]!.fen, mover: 'black', lastMove: game2.moves[3]!.lastMove, moveDelaySeconds: 4 })
  expect(await moveStream.next()).toEqual({ fen: game2.moves[4]!.fen, mover: 'white', lastMove: game2.moves[4]!.lastMove, moveDelaySeconds: 9 })
  expect(await moveStream.next()).toEqual({ fen: game2continued.moves[5]!.fen, mover: 'black', lastMove: game2continued.moves[5]!.lastMove, moveDelaySeconds: 5 })
  expect(await moveStream.next()).toEqual({ winner: 'white', reason: 'resignation' })
})