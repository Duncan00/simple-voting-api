'use strict';

const path = require('path');

const Common = {
	whoami: ctx => {
		const body = {
			// if Cloudflare DNS binds the domain to a wrong service, we can recognize
			service: 'simple-voting',
			version: 'v1'
		};

		if (['production', 'testing'].includes(ctx.config.env)) {
			body.build = require(path.resolve(
				__dirname,
				'../../../build.json'
			));
		} else {
			body.build = 'Unknown';
		}

		ctx.body = body;
	}
};

module.exports = Common;
