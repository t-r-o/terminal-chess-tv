module.exports = {
  testMatch: [
    '<rootDir>/test/**/*.+(test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: ['src/**/*.{tsx,ts}'],
  collectCoverage: true
}
