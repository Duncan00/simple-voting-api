'use strict';

const logError = require('../logError');

describe('logError', () => {
	const mockLogger = {
		error: jest.fn()
	};

	const ctx = {
		get: id => id,
		method: 'method',
		length: 'length',
		href: 'href',
		state: {
			request_cycle_trace_id: 'request_cycle_trace_id',
			response_time: 'response_time',
			user: {
				id: 'id'
			}
		},
		ip: 'ip',
		status: 'status-from-ctx'
	};

	beforeEach(() => {
		mockLogger.error.mockReset();
	});
	test('ctx status missing -> use err.status', () => {
		const error = new Error('testing');
		error.stack = undefined;
		error.message = 'message in error.message';
		error.status = 'status-from-error';
		logError({logger: mockLogger})(error, {
			...ctx,
			status: undefined
		});

		expect(mockLogger.error.mock.calls).toMatchSnapshot(
			'message from message'
		);
	});
	test('should match snapshot when call logger.error(), error.stack', () => {
		const error = new Error('testing');
		error.stack = 'mock-stack';
		logError({logger: mockLogger})(error, ctx);

		expect(mockLogger.error.mock.calls).toMatchSnapshot();
	});
	test('error without stack', () => {
		const error = new Error('testing');
		error.stack = undefined;
		error.message = 'message in error.message';
		logError({logger: mockLogger})(error, ctx);

		expect(mockLogger.error.mock.calls).toMatchSnapshot(
			'message from message'
		);
	});
	test('error without stack and message', () => {
		const error = new Error('testing');
		error.stack = undefined;
		error.message = undefined;
		error.details = 'message in details';
		logError({logger: mockLogger})(error, ctx);

		expect(mockLogger.error.mock.calls).toMatchSnapshot(
			'message from details'
		);
	});
	test('ctx with user id', () => {
		const error = new Error('testing');
		error.stack = undefined;
		error.message = undefined;
		error.details = 'message in details';
		logError({logger: mockLogger})(
			error,
			Object.assign({}, ctx, {
				state: {
					user: {
						id: 'user-id'
					}
				}
			})
		);

		expect(mockLogger.error.mock.calls).toMatchSnapshot();
	});
});
