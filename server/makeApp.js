'use strict';

const bodyParser = require('koa-bodyparser');
const responseTime = require('koa-response-time');
const compress = require('koa-compress');
const {NODE_ENVS} = require('./enums/nodeEnvs');
const decorateBody = require('./middlewares/decorateBody');
const logRequestResponse = require('./middlewares/logRequestResponse');
const attachContextLogger = require('./middlewares/attachContextLogger');
const attachRequestCycleTraceId = require('./middlewares/attachRequestCycleTraceId');
const notFound = require('./middlewares/notFound');
const handleError = require('./errors/handleError');
const logError = require('./listeners/logError');

function nonProductionSetup({app, env}) {
	if (env === NODE_ENVS.DEVELOPMENT) {
		app.use(require('@koa/cors')());
	}
	if ([NODE_ENVS.DEVELOPMENT, NODE_ENVS.TESTING].includes(env)) {
		const {docs} = require('swagger-ajv').middlewares.koa;
		const schemas = require('./schemas');
		app.use(docs(schemas.swagger));
	}
}

module.exports = async function makeApp({router, logger, config, app}) {
	// global available tools/utils
	// eslint-disable-next-line no-param-reassign
	app.context.config = config;
	nonProductionSetup({app, env: config.env});

	return (
		app
			.on('error', logError({logger}))
			.use(compress())
			.use(handleError())
			.use(attachRequestCycleTraceId())
			.use(attachContextLogger({logger}))
			// global middlewares
			.use(responseTime())
			// the application only supports json payload
			.use(
				bodyParser({
					enableTypes: ['json']
				})
			)
			.use(logRequestResponse())
			.use(decorateBody())
			// mount all routes
			.use(router.insecure.routes())
			.use(router.insecure.allowedMethods())

			.use(notFound())
	);
};
