module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.js$': ['babel-jest', { presets: ['@babel/preset-env'] }]
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  testMatch: ['**/__tests__/**/*.js'],
  moduleFileExtensions: ['js', 'json', 'node'],
  extensionsToTreatAsEsm: ['.js']
};
