'use strict';

const {ERROR_KEYS, makeError, HTTP_RESPONSES} = require('../../index');
const handleError = require('../');
const _ = require('lodash');

describe('handleError', () => {
	const ctx = {};

	test('success', async () => {
		const next = jest.fn().mockResolvedValue();

		await handleError()(ctx, next);
		expect(next).toBeCalledTimes(1);
	});

	test('meta_code globally unique', () => {
		const codes = Object.values(ERROR_KEYS).map(
			k => HTTP_RESPONSES[k].meta_code
		);
		expect(codes).toEqual(_.uniq(codes));
		expect(codes).toMatchSnapshot('list of meta_codes');
	});

	test('schema validation error', async () => {
		const next = jest.fn(async () => {
			const mock_ajv_err = new Error('Schema validation error');
			mock_ajv_err.isSwaggerAjvValidationError = true;
			mock_ajv_err.details = [
				{
					path: 'data.user_id',
					info: 'data.user_id is a required property'
				},
				{
					path: 'data.started',
					info: 'data.started is a required property'
				}
			];
		});
		await handleError()(ctx, next);
		expect(ctx).toMatchSnapshot('rendered error response');
	});

	describe('handleKnownError', () => {
		Object.values(ERROR_KEYS)
			.filter(k => k !== ERROR_KEYS.INTERNAL)
			.forEach(key => {
				test(`ERROR_KEY = ${key.toString()}`, async () => {
					const err = makeError(key);
					const next = jest.fn().mockRejectedValueOnce(err);
					await handleError()(ctx, next);
					expect(ctx).toMatchSnapshot('> http response of the error');
				});
				test(`render error details for ${key.toString()}`, async () => {
					const err = makeError(key).withDetail(
						null,
						'Additional error message is shown.'
					);
					const next = jest.fn().mockRejectedValueOnce(err);
					await handleError()(ctx, next);
					expect(ctx).toMatchSnapshot('> http response of the error');
				});
			});
	});

	describe('handleUnknownError', () => {
		test('for err.details not an array, hide it in http reponse', async () => {
			ctx.config = {
				env: 'production'
			};
			ctx.app = {
				emit: jest.fn()
			};
			const err = new Error('whatever');
			err.details = 'lorem ipsum error details in text';
			const next = jest.fn().mockImplementation(async () => {
				throw err;
			});

			await handleError()(ctx, next);
			expect(ctx.body).toMatchSnapshot('> http response of the error');
		});
		test('unexpected error to match correct ctx', async () => {
			ctx.config = {
				env: 'development'
			};
			ctx.app = {
				emit: jest.fn()
			};
			const err = new Error('test error');
			const next = jest.fn().mockImplementation(async () => {
				throw err;
			});

			await handleError()(ctx, next);
			expect(ctx.app.emit).toBeCalledWith('error', err, ctx);
			expect(ctx).toEqual(
				Object.assign(ctx, {
					body: {
						data: {},
						meta: {
							code: 500,
							details: err.stack
						}
					},
					status: 500
				})
			);
		});

		test('unexpected error to match correct ctx with different env', async () => {
			ctx.config = {
				env: 'test'
			};
			ctx.app = {
				emit: jest.fn()
			};
			const err = new Error('test error');
			const next = jest.fn().mockImplementation(async () => {
				throw err;
			});

			await handleError()(ctx, next);
			expect(ctx.app.emit).toBeCalledWith('error', err, ctx);
			expect(ctx).toEqual(
				Object.assign(ctx, {
					body: {
						data: {},
						meta: {
							code: 500,
							details: [],
							message: 'Internal Error'
						}
					},
					status: 500
				})
			);
		});
	});
});
