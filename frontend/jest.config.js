export const testEnvironment = 'jsdom';
export const transform = {
  '^.+\\.jsx?$': 'babel-jest',
};
export const moduleFileExtensions = ['js', 'jsx'];
export const testPathIgnorePatterns = ['/node_modules/', '/dist/'];
export const setupFilesAfterEnv = ['<rootDir>/setupTests.js'];