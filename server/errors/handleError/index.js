'use strict';

const {NODE_ENVS} = require('../../enums/nodeEnvs');
const {HTTP_RESPONSES, ERROR_KEYS} = require('../index');
const throwIfFalsy = require('../../utils/throwIfFalsy');
const _ = require('lodash');

const getErrorKey = err => {
	if (err.isSwaggerAjvValidationError) {
		return ERROR_KEYS.SCHEMA_VALIDATION_ERROR;
	}
	if (err.ERROR_KEY && HTTP_RESPONSES[err.ERROR_KEY]) {
		return err.ERROR_KEY;
	}
	return ERROR_KEYS.INTERNAL;
};

function getErrorResponseMeta({code, message, details = []}) {
	throwIfFalsy({code, message});
	return {
		code,
		message,
		errors: details.map(({info, path}) => ({info, path}))
	};
}

const getErrorKeysAndDetailsForHttpResponse = (err, ctx) => {
	const error_key = getErrorKey(err);
	// we always expect err.details is an array
	// and we don't want to expose unexpected details
	const details = _.isArray(err.details) ? err.details : [];
	/**
	 *  display error stack for development
	 */
	if (
		error_key === ERROR_KEYS.INTERNAL &&
		[NODE_ENVS.TEST, NODE_ENVS.DEVELOPMENT].includes(ctx.config.env)
	) {
		details.push({
			path: null,
			info: err.stack
		});
	}
	return {details, error_key};
};

module.exports = () =>
	async function handleError(ctx, next) {
		try {
			await next();
		} catch (err) {
			const {error_key, details} = getErrorKeysAndDetailsForHttpResponse(
				err,
				ctx
			);

			const {status, meta_code, message} = HTTP_RESPONSES[error_key];
			ctx.status = status;
			ctx.body = {
				meta: getErrorResponseMeta({
					status,
					code: meta_code,
					message,
					details
				}),
				data: {}
			};

			error_key === ERROR_KEYS.INTERNAL &&
				ctx.app.emit('error', err, ctx);
		}
	};
