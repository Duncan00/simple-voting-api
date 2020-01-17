'use strict';

const Redis = require('ioredis');

async function getRedis({nodes, logger}) {
	const client = new Redis.Cluster(nodes, {
		scaleReads: 'slave'
	});

	client.on('error', err => {
		logger.error(err);
	});

	const pong = await client.ping();
	if (pong === 'PONG') {
		logger.info({message: '[REDIS] Successful connection', nodes});
	} else {
		throw new Error(`[REDIS] Health check failed: ${pong}`);
	}
	return client;
}

module.exports = getRedis;
