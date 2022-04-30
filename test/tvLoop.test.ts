import { when } from 'jest-when'
import { GameStart, Move } from '../src/moveStream'
import { runNext } from '../src/tvLoop'
import { GameResult, UIState } from '../src/types'
import { advanceTimersBy } from './testUtils'

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

test('runNext GameStart', async () => {
  const gameStart: GameStart = {
    white: {
      name: 'p1',
      rating: 2500,
      title: 'GM',
      secondsRemaining: 180
    },
    black: {
      name: 'p2',
      rating: 2400,
      title: 'IM',
      secondsRemaining: 180
    },
    id: 'g1'
  }

  const transformUI = jest.fn()
  const shouldContinue = jest.fn()
  when(shouldContinue).calledWith().mockReturnValue(true)
  const promise = runNext(gameStart, transformUI, shouldContinue)
  expect(transformUI).toHaveBeenCalledTimes(1)
  await advanceTimersBy(1000)
  await promise
  expect(transformUI).toHaveBeenCalledTimes(1)
})

test('runNext GameEnd', async () => {
  const gameEnd: GameResult = {
    winner: 'black',
    reason: 'checkmate'
  }
  const transformUI = jest.fn()
  const shouldContinue = jest.fn()
  when(shouldContinue).calledWith().mockReturnValue(true)
  const promise = runNext(gameEnd, transformUI, shouldContinue)
  expect(transformUI).toHaveBeenCalledTimes(1)
  await advanceTimersBy(1000)
  await promise
  expect(transformUI).toHaveBeenCalledTimes(1)
})

test('runNext Move zero-seconds', async () => {
  let initialUI: UIState | undefined = {
    fen: 'f1',
    white: {
      name: 'p1',
      rating: 2800,
      title: 'GM',
      secondsRemaining: 10
    },
    black: {
      name: 'p2',
      rating: 2500,
      title: 'IM',
      secondsRemaining: 20
    },
    mover: 'black',
    id: 'game1',
    lastMove: {
      from: 'g4',
      to: 'g7'
    }
  }

  const mockUITransformer = jest.fn().mockImplementation((f) => {
    initialUI = f(initialUI)
  })

  const move: Move = {
    fen: 'f2',
    moveDelaySeconds: 0,
    mover: 'black',
    lastMove: {
      from: 'e2',
      to: 'e4'
    }
  }
  const shouldContinue = jest.fn()
  when(shouldContinue).calledWith().mockReturnValue(true)
  const promise = runNext(move, mockUITransformer, shouldContinue)
  await advanceTimersBy(399)
  expect(mockUITransformer).not.toBeCalled()
  await advanceTimersBy(1)
  expect(mockUITransformer).toBeCalledTimes(1)
  expect(initialUI).toEqual({
    fen: 'f2',
    white: {
      name: 'p1',
      rating: 2800,
      title: 'GM',
      secondsRemaining: 10
    },
    black: {
      name: 'p2',
      rating: 2500,
      title: 'IM',
      secondsRemaining: 20
    },
    mover: 'white',
    id: 'game1',
    lastMove: {
      from: 'e2',
      to: 'e4'
    }
  })
  await promise
  expect(mockUITransformer).toHaveBeenCalledTimes(1)
})

test('runNext Move multiple-seconds', async () => {
  let currentUI: UIState | undefined = {
    fen: 'f1',
    white: {
      name: 'p1',
      rating: 2800,
      title: 'GM',
      secondsRemaining: 10
    },
    black: {
      name: 'p2',
      rating: 2500,
      title: 'IM',
      secondsRemaining: 20
    },
    mover: 'black',
    id: 'game1',
    lastMove: {
      from: 'g4',
      to: 'g7'
    }
  }

  const mockUITransformer = jest.fn().mockImplementation((f) => {
    currentUI = f(currentUI)
  })

  const move: Move = {
    fen: 'f2',
    moveDelaySeconds: 3,
    mover: 'black',
    lastMove: {
      from: 'e2',
      to: 'e4'
    }
  }
  const shouldContinue = jest.fn()
  when(shouldContinue).calledWith().mockReturnValue(true)
  const promise = runNext(move, mockUITransformer, shouldContinue)
  await advanceTimersBy(1000)
  expect(mockUITransformer).toBeCalledTimes(1)
  // black seconds decrease
  expect(currentUI).toEqual({
    fen: 'f1',
    white: {
      name: 'p1',
      rating: 2800,
      title: 'GM',
      secondsRemaining: 10
    },
    black: {
      name: 'p2',
      rating: 2500,
      title: 'IM',
      secondsRemaining: 19
    },
    mover: 'black',
    id: 'game1',
    lastMove: {
      from: 'g4',
      to: 'g7'
    }
  })
  await advanceTimersBy(1000)
  expect(mockUITransformer).toBeCalledTimes(2)
  // black seconds decrease
  expect(currentUI).toEqual({
    fen: 'f1',
    white: {
      name: 'p1',
      rating: 2800,
      title: 'GM',
      secondsRemaining: 10
    },
    black: {
      name: 'p2',
      rating: 2500,
      title: 'IM',
      secondsRemaining: 18
    },
    mover: 'black',
    id: 'game1',
    lastMove: {
      from: 'g4',
      to: 'g7'
    }
  })
  await advanceTimersBy(1000)
  // black seconds decrease and updates to lastMove, fen, mover
  expect(currentUI).toEqual({
    fen: 'f2',
    white: {
      name: 'p1',
      rating: 2800,
      title: 'GM',
      secondsRemaining: 10
    },
    black: {
      name: 'p2',
      rating: 2500,
      title: 'IM',
      secondsRemaining: 17
    },
    mover: 'white',
    id: 'game1',
    lastMove: {
      from: 'e2',
      to: 'e4'
    }
  })
  await promise
})
