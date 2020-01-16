'use strict';

const handleShutdown = require('..');

describe('handleShutdown', () => {
	test('should listen to shutdown signal and setup', () => {
		const server = {};
		const app = {};
		const redis = {};
		const logger = {};
		process.on = jest.fn();

		handleShutdown({server, app, redis, logger});

		expect(process.on.mock.calls).toMatchSnapshot('process.on');
	});
});
