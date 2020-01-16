'use strict';

const {UNEXPECTED_INTERNAL_ERROR} = require('../enums/monitorEventKeys');

module.exports = ({logger}) =>
	function logError(err, ctx) {
		const {request_cycle_trace_id} = ctx.state;
		// https://cloud.google.com/error-reporting/docs/formatting-error-messages
		const errObj = {
			request_cycle_trace_id,
			// stackdriver suggested to provide stack in the message
			message: err.stack || err.message || err.details,
			details: err.details || '',
			// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#HttpRequest
			httpRequest: {
				status: ctx.status || err.status,
				userAgent: ctx.get('user-agent'),
				referer: ctx.get('referer'),
				requestMethod: ctx.method,
				responseSize: ctx.length,
				requestUrl: ctx.href,
				latency: ctx.state.response_time,
				remoteIp: ctx.ip
			},
			user: ctx.state.user ? ctx.state.user.id : '',
			// for stackdriver custom metrics
			MONITOR_EVENT_KEY: UNEXPECTED_INTERNAL_ERROR
		};
		logger.error(errObj);
	};
