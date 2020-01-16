'use strict';

module.exports = {
	rootDir: 'server',
	moduleFileExtensions: ['js', 'json', 'node'],
	testPathIgnorePatterns: ['__fixtures__', 'test.js'],
	testURL: 'http://localhost',
	testEnvironment: 'node',
	moduleDirectories: ['node_modules', '<rootDir>'],
	collectCoverage: true,
	collectCoverageFrom: ['**/*.js'],
	coverageDirectory: '<rootDir>/../coverage',
	coverageReporters: ['lcov', 'text', 'text-summary'],
	coverageThreshold: {
		global: {
			statements: 80,
			branches: 80,
			lines: 80,
			functions: 80
		}
	},
	coveragePathIgnorePatterns: [
		'/node_modules/',
		'/server/models/schemas/',
		'/server/server.js'
	],
	watchPlugins: [
		'jest-watch-typeahead/filename',
		'jest-watch-typeahead/testname'
	]
};
