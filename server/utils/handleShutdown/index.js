'use strict';

const handleExit = require('./handleExit');

function handleShutdown({server, app, redis, logger}) {
	process.on('SIGINT', handleExit({server, app, redis, logger}));
	process.on('SIGTERM', handleExit({server, app, redis, logger}));
}

module.exports = handleShutdown;
