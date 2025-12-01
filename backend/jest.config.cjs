module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/config/**',
  ],
  // Coverage thresholds for Phase 2 (critical paths only)
  // Will expand to full codebase in Phase 3+
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'config',
    'routes',
    'middleware',
  ],
};
