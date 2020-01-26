'use strict';

async function initServer() {
	let root_logger = console;
	try {
		/**
		 *  normally you should place require statements at the top
		 *  but here we want to be able to catch every error
		 *  including those happened during requiring modules
		 *  so we wrap them in the try-catch block
		 */
		const http = require('http');
		const config = require('config');
		const {NODE_ENVS} = require('./enums/nodeEnvs');
		const loggerFactory = require('./services/loggerFactory/index');
		const winston = require('winston');
		const Koa = require('koa');
		const getRedis = require('./services/redis/getRedis');
		const Redlock = require('redlock');
		const router = require('./router');

		root_logger = loggerFactory({
			winston,
			log_level: config.log_level,
			env: config.env
		});

		const redis = await getRedis({
			nodes: config.services.redis.nodes,
			logger: root_logger
		});

		const redlock = new Redlock(
			[redis],
			config.services.redis.redlock.options
		);

		const koa_instance = new Koa();
		return require('./makeApp')({
			router: router({redis, redlock}),
			logger: root_logger,
			config,
			app: koa_instance
		}).then(app => {
			const server = http.createServer(app.callback());
			require('./utils/handleShutdown')({
				server,
				app,
				logger: root_logger,
				redis
			});

			server.keepAliveTimeout = 120 * 1000;
			// https://nodejs.org/api/http.html#http_server_timeout
			// default server timeout will be 2 mins, google load balancer timeout on 30 seconds
			// to be safe, we set a 28 seconds timeout
			server.timeout = 28 * 1000;

			root_logger.info(`[SERVER] Current env: ${config.env}`);
			if (config.env !== NODE_ENVS.TEST) {
				server.listen(config.port);
				root_logger.info('[SERVER] Started at port:' + config.port);
			}
			return server;
		});
	} catch (error) {
		root_logger.error({
			message: error.message,
			stack: error.stack
		});
		throw error;
	}
}

module.exports = initServer;
