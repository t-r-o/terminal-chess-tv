import React from 'react'
import { render } from 'ink-testing-library'
import stripAnsi from 'strip-ansi'
import GameInfo, { formatPlayerName } from '../../src/components/GameInfo'
import { Player } from '../../src/types'

test('formatPlayerName', () => {
  expect(formatPlayerName('shortPlayerName1', true)).toEqual('shortPlayerName1')
  expect(formatPlayerName('longPlayerName123', true)).toEqual('longPlayerNam...')
  expect(formatPlayerName('longPlayerName123456', false)).toEqual('longPlayerName12...')
  expect(formatPlayerName('shortPlayerName1234', false)).toEqual('shortPlayerName1234')
})

test('GameInfo', () => {
  const white: Player = {
    name: 'player1',
    rating: 2500,
    secondsRemaining: 180
  }
  const black: Player = {
    name: 'player2',
    rating: 2600,
    secondsRemaining: 175,
    title: 'IM'
  }
  const { lastFrame } = render(<GameInfo white={white} black={black} mover="white" />)
  const frame = stripAnsi(lastFrame()!)

  const expected = `
player1 (2500)             180s ·
player2 IM (2600)          175s `

  expect(frame).toEqual(expected.slice(1))
})
