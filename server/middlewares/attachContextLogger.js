'use strict';

module.exports = ({logger}) =>
	function attachContextLogger(ctx, next) {
		const {request_cycle_trace_id} = ctx.state;
		ctx.logger = logger.child({request_cycle_trace_id});
		return next();
	};
