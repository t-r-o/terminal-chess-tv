/**
 * Expect input arrays to be equal size in order for zip to work
 */
export function zipMap<X, Y, Z> (x: X[], y: Y[], mapper: (x: X, y: Y) => Z): Z[] {
  return x.map((x, idx) => mapper(x, y[idx]!))
}

const enterAltScreenCommand = '\x1b[?1049h'
const leaveAltScreenCommand = '\x1b[?1049l'

export const enterFullscreen = (): void => { process.stdout.write(enterAltScreenCommand) }
export const exitFullscreen = (): void => { process.stdout.write(leaveAltScreenCommand) }
