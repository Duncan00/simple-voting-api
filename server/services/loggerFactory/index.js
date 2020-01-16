'use strict';

const levels = require('./levels');

function loggerFactory({winston, log_level, env}) {
	const format = require(`./formats/${env}`)({winston});
	return winston.createLogger({
		levels,
		level: log_level,
		format,
		transports: [new winston.transports.Console()]
	});
}

module.exports = loggerFactory;
