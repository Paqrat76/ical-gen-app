'use strict';

import { baseConfig } from './jest.config.base.mjs';
import packageJSON from './package.json' with { type: 'json' };

/**
 * Package-specific Jest configuration. Loads the base Jest configuration as the first line.
 * All lines following the first line override or add to the base configuration. Using the
 * 'displayName' property will result in Jest providing the package name for each test comment
 * in the terminal output.
 */
export default {
  ...baseConfig,
  displayName: packageJSON.name,
  moduleFileExtensions: ['js', 'ts'],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  roots: ['<rootDir>/src', '<rootDir>/test'],
  transform: {
    '^.+\\.ts$': [
      '<rootDir>/node_modules/ts-jest',
      // https://kulshekhar.github.io/ts-jest/docs/getting-started/options/transpilation
      {
        transpilation: true,
      },
    ],
  },
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/test/**',
    '!<rootDir>/lib/**',
  ],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
