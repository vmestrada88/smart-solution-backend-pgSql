
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!server.js',
    '!model/db.js'
  ],
  coverageThreshold: {
    global: {
      branches: 91,
      functions: 91,
      lines: 91,
      statements: 91
    }
  }
};