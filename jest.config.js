export default {
  // Environment pour les tests
  testEnvironment: 'node',

  // Extensions des fichiers de test
  moduleFileExtensions: ['js', 'json'],

  // Pattern pour trouver les fichiers de test
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // Configuration pour ES Modules
  preset: null,
  transform: {},
  extensionsToTreatAsEsm: [],

  // standard ESM resolution

  // Variables d'environnement pour les tests
  setupFilesAfterEnv: ['<rootDir>/src/backend/tests/setup.js'],

  // Timeout pour les tests
  testTimeout: 30000,

  // Coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/backend/**/*.js',
    '!src/backend/tests/**',
    '!src/backend/scripts/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
