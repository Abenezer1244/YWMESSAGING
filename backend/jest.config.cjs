module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@faker-js|uuid|libphonenumber-js)/)',
  ],
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Coverage collection
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/config/**',
    '!src/types/**',
  ],

  // Coverage thresholds for Phase 1 (critical paths only)
  // Will expand in Phase 2+
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 40,
      lines: 40,
      statements: 40,
    },
    './src/services/auth.service.ts': {
      branches: 95,
      functions: 100,
      lines: 95,
      statements: 95,
    },
    './src/services/message.service.ts': {
      branches: 90,
      functions: 95,
      lines: 90,
      statements: 90,
    },
    './src/services/billing.service.ts': {
      branches: 90,
      functions: 95,
      lines: 90,
      statements: 90,
    },
  },

  // Coverage reporting
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
  coverageDirectory: '<rootDir>/coverage',

  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'types',
  ],

  // Test timeout
  testTimeout: 10000,

  // Performance
  maxWorkers: '50%',
  cacheDirectory: '<rootDir>/.jest-cache',
};
