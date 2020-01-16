'use strict';

const dotenv = require('dotenv');
const fs = require('fs');
const _ = require('lodash');

const example_config = dotenv.parse(fs.readFileSync('dev.env.example'));
const dev_config = dotenv.parse(fs.readFileSync('dev.env'));

const missing_keys = Object.keys(example_config).filter(env_var =>
	_.isUndefined(dev_config[env_var])
);

if (missing_keys.length > 0) {
	// eslint-disable-next-line no-console
	console.error(
		`your "./dev.env" file lack some keys! (see ./dev.env.example)`
	);
	// eslint-disable-next-line no-console
	console.error(missing_keys);
	process.exit(-1);
}
