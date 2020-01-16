'use strict';

const logRequestResponse = require('../logRequestResponse');
const skipRoutes = require('../logRequestResponse/skip_routes');

describe('logRequestResponse', () => {
	const logger = {
		info: () => {}
	};
	beforeEach(() => {
		jest.spyOn(logger, 'info');
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	test('logRequestResponse', async () => {
		const ctx = {
			logger,
			get: jest.fn(s => s),
			state: {
				request_cycle_trace_id: 'request_cycle_trace_id'
			},
			query: {
				product: 'product'
			},
			path: '/whatever',
			request: {
				body: {
					mock_post_payload: true
				}
			},
			body: 'mock_body',
			status: 'mock_status'
		};
		const next = jest.fn();
		await logRequestResponse()(ctx, next);
		expect(logger.info.mock.calls).toMatchSnapshot('logger.info calls');
		expect(next).toHaveBeenCalledTimes(1);
	});

	test('logRequestResponse with options', async () => {
		const options = {
			extract_ctx_data: jest.fn()
		};
		const ctx = {
			logger,
			get: jest.fn(s => s),
			state: {
				request_cycle_trace_id: 'request_cycle_trace_id'
			},
			query: {
				product: 'product'
			},
			path: '/whatever',
			request: {
				body: {
					mock_post_payload: true
				}
			},
			body: 'mock_body',
			status: 'mock_status'
		};
		const next = jest.fn();
		await logRequestResponse(options)(ctx, next);
		expect(logger.info.mock.calls).toMatchSnapshot(
			'logger.info calls with options'
		);
		expect(next).toHaveBeenCalledTimes(1);
	});

	test('list of skip routes', async () => {
		expect(skipRoutes).toMatchSnapshot();
	});

	skipRoutes.forEach(route => {
		test(`${route} path should be skipped`, async () => {
			const ctx = {
				path: `/${route}`,
				logger
			};
			const next = jest.fn();
			await logRequestResponse()(ctx, next);
			expect(logger.info.mock.calls).toEqual([]);
			expect(next).toHaveBeenCalledTimes(1);
		});
	});
});
