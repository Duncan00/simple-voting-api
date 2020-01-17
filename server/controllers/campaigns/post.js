'use strict';

const uuid = require('uuid/v4');
const _ = require('lodash');
const {ERROR_KEYS, makeError} = require('../../errors');
const buildCampaignRecord = require('./buildCampaignRecord');
const buildCampaignResource = require('./buildCampaignResource');
const {CAMPAIGN} = require('../../enums/redisPrefix');

function post({redis}) {
	return async function create(ctx) {
		const {title, start_date, end_date, candidates} = ctx.request.body;

		validateUniqueCandidates(candidates);

		// Store to redis
		const id = uuid();
		const campaign_to_store = buildCampaignRecord({
			id,
			title,
			start_date,
			end_date,
			candidates
		});
		await redis.hmset(`${CAMPAIGN}:${id}`, campaign_to_store);

		// Query created result & response
		const db_campaign = await redis.hgetall(`${CAMPAIGN}:${id}`);
		ctx.status = 201;
		ctx.body = buildCampaignResource(db_campaign);
	};
}

function validateUniqueCandidates(candidates) {
	const names = candidates.map(candidate => candidate.name);
	if (_.uniq(names).length < candidates.length) {
		throw makeError(ERROR_KEYS.CANDIDATE_NAMES_CONFLICT);
	}
}

module.exports = post;
