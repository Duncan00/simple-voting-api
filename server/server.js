'use strict';

const initServer = require('./initServer');

initServer().catch(() => {
	process.exit(1);
});
