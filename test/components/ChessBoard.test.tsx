import React from 'react'
import { render } from 'ink-testing-library'
import ChessBoard from '../../src/components/ChessBoard'
import { startingFen } from '../../src/chess'
import stripAnsi from 'strip-ansi'

test('ChessBoard', () => {
  const { lastFrame } = render(<ChessBoard fen={startingFen} />)
  const frame = stripAnsi(lastFrame()!)
  const expected = `
┌───┬───┬───┬───┬───┬───┬───┬───┐
│ ♖ │ ♘ │ ♗ │ ♕ │ ♔ │ ♗ │ ♘ │ ♖ │
├───┼───┼───┼───┼───┼───┼───┼───┤
│ ♙ │ ♙ │ ♙ │ ♙ │ ♙ │ ♙ │ ♙ │ ♙ │
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │   │   │   │   │   │   │   │
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │   │   │   │   │   │   │   │
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │   │   │   │   │   │   │   │
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │   │   │   │   │   │   │   │
├───┼───┼───┼───┼───┼───┼───┼───┤
│ ♟ │ ♟ │ ♟ │ ♟ │ ♟ │ ♟ │ ♟ │ ♟ │
├───┼───┼───┼───┼───┼───┼───┼───┤
│ ♜ │ ♞ │ ♝ │ ♛ │ ♚ │ ♝ │ ♞ │ ♜ │
└───┴───┴───┴───┴───┴───┴───┴───┘`
  expect(frame).toEqual(expected.slice(1)) // ignore the initial newline in expected
})

test('ChessBoard RuyLopez', () => {
  const { lastFrame } = render(<ChessBoard fen="r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3" lastMove={{ from: 'f1', to: 'b5' }} />)
  const frame = stripAnsi(lastFrame()!)
  const expected = `
┌───┬───┬───┬───┬───┬───┬───┬───┐
│ ♖ │   │ ♗ │ ♕ │ ♔ │ ♗ │ ♘ │ ♖ │
├───┼───┼───┼───┼───┼───┼───┼───┤
│ ♙ │ ♙ │ ♙ │ ♙ │   │ ♙ │ ♙ │ ♙ │
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │   │ ♘ │   │   │   │   │   │
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │ ♝ │   │   │ ♙ │   │   │   │
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │   │   │   │ ♟ │   │   │   │
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │   │   │   │   │ ♞ │   │   │
├───┼───┼───┼───┼───┼───┼───┼───┤
│ ♟ │ ♟ │ ♟ │ ♟ │   │ ♟ │ ♟ │ ♟ │
├───┼───┼───┼───┼───┼───┼───┼───┤
│ ♜ │ ♞ │ ♝ │ ♛ │ ♚ │ · │   │ ♜ │
└───┴───┴───┴───┴───┴───┴───┴───┘`
  expect(frame).toEqual(expected.slice(1))
})
