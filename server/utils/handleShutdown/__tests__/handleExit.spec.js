'use strict';

const handleExit = require('../handleExit');

describe('handleExit', () => {
	test('should gracefully shutdown', async () => {
		const app = {
			isTerminating: false
		};
		const redis = {
			quit: jest.fn()
		};
		const logger = {
			info: jest.fn()
		};
		const server = {
			close: jest.fn().mockImplementation(async callback => {
				await callback();
			})
		};
		process.exit = jest.fn();

		await handleExit({server, app, redis, logger})();

		expect(redis.quit.mock.calls).toMatchSnapshot('redis.quit');
		expect(logger.info.mock.calls).toMatchSnapshot('logger.info');
		expect(logger.info.mock.calls).toMatchSnapshot('logger.info');
		expect(process.exit.mock.calls).toMatchSnapshot('process.exit');
	});

	test('should skip if already shutting down', async () => {
		const app = {
			isTerminating: true
		};
		const redis = {
			quit: jest.fn()
		};
		const logger = {
			info: jest.fn()
		};
		const server = {
			close: jest.fn().mockImplementation(async callback => {
				await callback();
			})
		};
		process.exit = jest.fn();

		await handleExit({server, app, redis, logger})();

		expect(redis.quit.mock.calls).toMatchSnapshot('redis.quit');
		expect(logger.info.mock.calls).toMatchSnapshot('logger.info');
		expect(logger.info.mock.calls).toMatchSnapshot('logger.info');
		expect(process.exit.mock.calls).toMatchSnapshot('process.exit');
	});
});
