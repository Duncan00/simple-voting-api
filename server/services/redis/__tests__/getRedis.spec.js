'use strict';

const on = jest.fn();
const ping = jest.fn();
const mockRedisClusterClass = function() {
	this.on = on;
	this.ping = ping;
};
jest.doMock('ioredis', () => ({
	Cluster: mockRedisClusterClass
}));
const getRedis = require('../getRedis');

describe('getRedis', () => {
	afterEach(() => {
		jest.resetModules();
		jest.resetAllMocks();
	});

	test('Setup successfully', async () => {
		ping.mockResolvedValue('PONG');
		const nodes = {};
		const logger = {
			info: jest.fn(),
			debug: jest.fn()
		};

		const redis = await getRedis({nodes, logger});

		expect(redis).toMatchSnapshot();
		expect(on).toHaveBeenCalledTimes(1);
		expect(ping).toHaveBeenCalledTimes(1);
	});

	test('Throw error if ping failed', async () => {
		ping.mockResolvedValue('Some Error');
		const nodes = {};
		const logger = {
			info: jest.fn(),
			debug: jest.fn()
		};

		let t;
		try {
			await getRedis({nodes, logger});
		} catch (e) {
			t = e;
		}

		expect(t).toMatchSnapshot();
		expect(on).toHaveBeenCalledTimes(1);
		expect(ping).toHaveBeenCalledTimes(1);
	});
});
