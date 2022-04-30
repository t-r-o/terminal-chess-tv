import { Chess } from 'chess.js'
import { fenToGameState, findCheckSquare, Pieces, squareToCoordinates } from '../src/chess'

test('squareToCoordinates', () => {
  expect(squareToCoordinates('a8')).toEqual({ col: 0, row: 0 })
  expect(squareToCoordinates('d3')).toEqual({ col: 3, row: 5 })
  expect(squareToCoordinates('g1')).toEqual({ col: 6, row: 7 })
})

test('findCheckSquare', () => {
  expect(findCheckSquare(new Chess('rnbqkbnr/pp2pppp/8/1Bpp4/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 1 3'))).toEqual({ row: 0, col: 4 })
  expect(findCheckSquare(new Chess('rn1k1bnr/pp1qpNpp/8/2pp1p1Q/4P3/8/PPPP1PPP/RNB1K2R b KQ - 3 7'))).toEqual({ row: 0, col: 3 })
  expect(findCheckSquare(new Chess())).toBeUndefined()
})

test('fenToGameState', () => {
  const gameState = fenToGameState('r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3')
  expect(gameState.inCheckSquare).toBeUndefined()
  const ruyLopez: Pieces[][] = [
    ['♖', ' ', '♗', '♕', '♔', '♗', '♘', '♖'],
    ['♙', '♙', '♙', '♙', ' ', '♙', '♙', '♙'],
    [' ', ' ', '♘', ' ', ' ', ' ', ' ', ' '],
    [' ', '♝', ' ', ' ', '♙', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', '♟', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', '♞', ' ', ' '],
    ['♟', '♟', '♟', '♟', ' ', '♟', '♟', '♟'],
    ['♜', '♞', '♝', '♛', '♚', ' ', ' ', '♜']
  ]
  expect(gameState.pieces).toEqual(ruyLopez)
})
