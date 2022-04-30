import { when } from 'jest-when'
import { doActions, UIAction } from '../src/uiUtils'
import { advanceTimersBy } from './testUtils'

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

test('doActions', async () => {
  const call = jest.fn()
  const actions: UIAction[] = [
    { ms: 500 },
    call,
    { ms: 200 },
    call,
    { ms: 10_000 },
    call
  ]
  const promise = doActions(actions, () => true)
  await advanceTimersBy(499)
  expect(call).not.toHaveBeenCalled()
  await advanceTimersBy(1)
  expect(call).toBeCalledTimes(1)
  await advanceTimersBy(199)
  expect(call).toBeCalledTimes(1)
  await advanceTimersBy(1)
  expect(call).toBeCalledTimes(2)
  await advanceTimersBy(9999)
  expect(call).toBeCalledTimes(2)
  await advanceTimersBy(1)
  expect(call).toHaveBeenCalledTimes(3)
  await promise
  expect(call).toHaveBeenCalledTimes(3)
})

test('doActions but stop early', async () => {
  const call = jest.fn()
  const actions: UIAction[] = [
    { ms: 500 },
    call,
    { ms: 200 },
    call,
    { ms: 10_000 },
    call
  ]
  const shouldContinue = jest.fn().mockReturnValue(true)
  const promise = doActions(actions, shouldContinue)
  await advanceTimersBy(500)
  expect(call).toBeCalledTimes(1)
  when(shouldContinue).calledWith().mockReturnValue(false)
  await advanceTimersBy(200)
  expect(call).toBeCalledTimes(1)
  await promise
  expect(call).toHaveBeenCalledTimes(1)
})
