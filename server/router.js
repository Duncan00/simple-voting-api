'use strict';

const Router = require('koa-router');
const common = require('./controllers/common');
const {validation} = require('swagger-ajv').middlewares.koa;
const schemas = require('./schemas');

module.exports = function router() {
	const insecure = new Router();
	insecure.use(validation(schemas.ajv)).get('/v1/whoami', common.whoami);

	return {
		insecure
	};
};
