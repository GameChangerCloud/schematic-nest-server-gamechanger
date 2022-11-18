module.exports = {
    modulePaths: ['src'],
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: './',
    testRegex: '.spec.ts$',
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    clearMocks: true,
    testPathIgnorePatterns: ['node_modules'],
    transform: {
      '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
    },
    coverageReporters: ['json-summary', 'text', 'lcov'],
  };
  