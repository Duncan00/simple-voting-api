'use strict';

const uuid = require('uuid').v4;

module.exports = () =>
	async function attachRequestCycleTraceId(ctx, next) {
		ctx.state.request_cycle_trace_id = uuid();
		await next();
	};
