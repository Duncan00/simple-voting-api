'use strict';

const Router = require('koa-router');
const common = require('./controllers/common');
const campaignController = require('./controllers/campaigns');
const {validation} = require('swagger-ajv').middlewares.koa;
const schemas = require('./schemas');

module.exports = function router({redis, redlock}) {
	const insecure = new Router();
	const campaign_controller = campaignController({redis, redlock});

	insecure
		.use(validation(schemas.ajv))
		.get('/v1/whoami', common.whoami)

		// Campaigns
		.post('/v1/campaigns', campaign_controller.post)
		.get('/v1/campaigns', campaign_controller.get)

		// Votes
		.post('/v1/campaigns/:id/votes', campaign_controller.votes.post);

	return {
		insecure
	};
};
