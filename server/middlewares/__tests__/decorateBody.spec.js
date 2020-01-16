'use strict';

// eslint-disable-next-line no-unused-vars
const decorateBody = require('../decorateBody');

jest.mock('http-status-codes', () => {
	return {
		getStatusText: jest.fn()
	};
});

describe('decorateBody', () => {
	const next = jest.fn();

	test('decorateBody', async () => {
		const ctx = {
			status: ''
		};
		await decorateBody()(ctx, next);

		expect(ctx).toEqual({
			status: ''
		});
	});

	test('decorateBody', async () => {
		const ctx = {
			body: {
				meta: 'test_meta'
			},
			status: ''
		};
		await decorateBody()(ctx, next);

		expect(ctx).toEqual({
			body: {
				meta: 'test_meta'
			},
			status: ''
		});
	});

	test('decorateBody', async () => {
		const ctx = {
			body: {},
			status: ''
		};
		await decorateBody()(ctx, next);

		expect(ctx).toEqual({
			body: {
				data: {},
				meta: {
					code: '',
					message: ''
				}
			},
			status: ''
		});
	});
});
