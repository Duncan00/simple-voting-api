'use strict';

const skipRoutes = require('./skip_routes');
const throwIfFalsy = require('../../utils/throwIfFalsy');

module.exports = (options = {}) =>
	async function logRequestResponse(ctx, next) {
		const {logger} = ctx;
		throwIfFalsy({logger});

		const {extract_ctx_data} = options;

		const should_skip = skipRoutes
			.map(r => typeof ctx.path === 'string' && ctx.path.includes(r))
			.find(Boolean);

		if (should_skip) {
			await next();
			return;
		}

		// log request
		const {request_cycle_trace_id} = ctx.state;
		const user_id = ctx.get('x-authorization-sub');
		const {request} = ctx;
		const data = extract_ctx_data ? extract_ctx_data(ctx) : {};
		logger.info({
			message: 'accessing path',
			request_cycle_trace_id,
			user_id,
			request,
			path: ctx.path,
			query: ctx.query,
			request_body: ctx.request.body,
			...data
		});
		await next();
		// log response
		logger.info({
			message: 'returning response',
			request_cycle_trace_id,
			response_body: ctx.body,
			response_status: ctx.status
		});
	};
