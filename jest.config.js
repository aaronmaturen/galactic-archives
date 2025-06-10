// jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jest-fixed-jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/e2e/', // Since we're using Playwright for e2e we need to exclude them from jest
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/environments/**',
  ],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1', // For clean imports
  },
  testMatch: [
    '**/*.spec.ts', // Using .spec.ts for test files
  ],
  reporters: process.env.CI
    ? ['default', ['jest-junit', { outputDirectory: 'test-results' }]]
    : ['default'],
};
