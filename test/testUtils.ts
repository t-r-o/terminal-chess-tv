// Hack for making fake timers advance when using promises with Jest > 27
export async function advanceTimersBy (ms: number) {
  jest.advanceTimersByTime(ms)
  return new Promise(jest.requireActual('timers').setImmediate)
}
