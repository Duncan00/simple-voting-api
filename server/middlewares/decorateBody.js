'use strict';

const HttpStatus = require('http-status-codes');

module.exports = () =>
	async function decorateBody(ctx, next) {
		try {
			await next();
		} finally {
			if (ctx.body) {
				if (!ctx.body.meta) {
					ctx.body = {
						meta: {
							code: ctx.status && Number(`${ctx.status}00`),
							message:
								ctx.message ||
								HttpStatus.getStatusText(ctx.status) ||
								''
						},
						data: ctx.body
					};
				}
			}
		}
	};
