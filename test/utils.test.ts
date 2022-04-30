import { zipMap } from '../src/utils'

test('zipMap', () => {
  expect(zipMap([1, 2, 3], [10, 100, 1000], (a, b) => a + b)).toEqual([11, 102, 1003])
})
