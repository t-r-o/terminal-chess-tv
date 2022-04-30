import React from 'react'
import winston from 'winston'
import { startingFen } from './chess'
import { getGame, MockClient } from './chessClient'
import { isGameResult, isGameStart, Move, MoveStream, Next } from './moveStream'
import { UIState } from './types'
import { doActions, UIAction } from './uiUtils'

// A function that transforms the UIState
type TransformUI = (prev: UIState | undefined) => UIState | undefined
// Executes functions that transform the UIState
type UITransformer = React.Dispatch<React.SetStateAction<UIState | undefined>>

export default async function tvLoop (transform: UITransformer, shouldContinue: () => boolean, useMockedGames = false) {
  winston.info('Using mocked games: ' + useMockedGames)
  const moveStream = useMockedGames ? new MoveStream(new MockClient()) : new MoveStream({ getGame })
  while (shouldContinue()) {
    const next = await moveStream.next()
    winston.debug('Next move', next)
    await runNext(next, transform, shouldContinue)
  }
  return Promise.resolve()
}

const gameStartPauseMs = 1000
const gameEndPauseMs = 1000
const zeroTimeMovePauseMs = 400

function toActions (next: Next, transformer: UITransformer): UIAction[] {
  if (isGameStart(next)) {
    return [
      () => transformer({ fen: startingFen, black: next.black, white: next.white, mover: 'white', id: next.id }),
      { ms: gameStartPauseMs }
    ]
  } else if (isGameResult(next)) {
    return [
      () => transformer((prev) => ({ ...prev!, result: next })),
      { ms: gameEndPauseMs }
    ]
  } else if (next.moveDelaySeconds === 0) {
    return [
      { ms: zeroTimeMovePauseMs },
      () => transformer(transformForMove(next))
    ]
  } else {
    return [
      ...clockDecrements(next, transformer, next.moveDelaySeconds),
      () => transformer(transformForMove(next))
    ]
  }
}

function clockDecrements (move: Move, transform: UITransformer, noOfDecrements: number): UIAction[] {
  const actions: Array<UIAction> = []
  for (let i = noOfDecrements; i > 0; i--) {
    actions.push({ ms: 1000 })
    actions.push(() => transform(decrementMoverClock(move)))
  }
  return actions
}

function decrementMoverClock (move: Move): TransformUI {
  return (prev) => {
    if (prev === undefined) {
      return undefined
    } else if (move.mover === 'white') {
      const secondsRemaining = prev.white.secondsRemaining - 1
      return {
        ...prev,
        white: { ...prev.white, secondsRemaining }
      }
    } else {
      const secondsRemaining = prev.black.secondsRemaining - 1
      return {
        ...prev,
        black: { ...prev.black, secondsRemaining }
      }
    }
  }
}

function transformForMove (move: Move): TransformUI {
  return (prev) => {
    return { ...prev!, fen: move.fen, mover: prev?.mover === 'white' ? 'black' : 'white', lastMove: move.lastMove }
  }
}

export async function runNext (next: Next, transform: UITransformer, shouldContinue: () => boolean): Promise<void> {
  const actions = toActions(next, transform)
  return doActions(actions, shouldContinue)
}
