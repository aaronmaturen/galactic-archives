// jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/e2e/', // Since we're using playwrite for e2e we need to exclude them from jest
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1', // For clean imports
  },
  testMatch: [
    '**/*.spec.ts', // Using .spec.ts for test files
  ],
};
