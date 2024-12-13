import jestConfig from './jest.config.js';


    export default {
        testEnvironment: 'node',
        testPathIgnorePatterns: ['/node_modules/'],
        coveragePathIgnorePatterns: ['/node_modules/'],
        testMatch: ['**/tests/**/*.test.js'],
      
    ...jestConfig,
};