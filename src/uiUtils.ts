// An action that pauses the series for a number of milliseconds
export type Pause = { ms: number }
export type UIAction = Pause | CallableFunction

/**
 * Runs a series of actions
 * @param actions the series of actions
 * @param shouldContinue a reference that allows you to stop any further action functions to be executed
 * @returns a Promise for the completion of the series
 */
export async function doActions (actions: UIAction[], shouldContinue: () => boolean): Promise<void> {
  const next = actions[0]
  const remainder = actions.slice(1)
  if (next === undefined || !shouldContinue()) {
    return Promise.resolve()
  } else if (isPause(next)) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(undefined)
      }, next.ms)
    }).then(() => doActions(remainder, shouldContinue))
  } else {
    next()
    return doActions(remainder, shouldContinue)
  }
}

function isPause (x: any): x is Pause {
  return 'ms' in x
}
