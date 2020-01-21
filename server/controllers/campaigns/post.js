'use strict';

const moment = require('moment');
const uuid = require('uuid/v4');
const _ = require('lodash');
const {ERROR_KEYS, makeError} = require('../../errors');
const buildCampaignRecord = require('./buildCampaignRecord');
const buildCampaignResource = require('./buildCampaignResource');
const {CAMPAIGN_PREFIX, VOTED_PREFIX} = require('../../enums/redisPrefix');

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

		const hkid_set_expired_at_ts = moment(end_date)
			.add(1, 'days')
			.format('X');

		const multi_pipeline = redis
			.multi()
			.hmset(`${CAMPAIGN_PREFIX}:{${id}}`, campaign_to_store)
			// Create a voted set for making the sets expire at end date + 1 day
			// To auto delete all HKID when we don't need them anymore
			// so that can free the major use of memory and comply with HK privacy regulation
			.sadd(`${VOTED_PREFIX}:{${id}}`, 0)
			.expireat(`${VOTED_PREFIX}:{${id}}`, hkid_set_expired_at_ts);
		// Create a voted set of each candidate for making the sets expire at end date + 1 day
		await _.reduce(
			candidates,
			(result, {name}) =>
				result
					.sadd(`${VOTED_PREFIX}:{${id}}:${name}`, 0)
					.expireat(
						`${VOTED_PREFIX}:{${id}}:${name}`,
						hkid_set_expired_at_ts
					),
			multi_pipeline
		).exec();

		// Query created result & response
		const db_campaign = await redis.hgetall(`${CAMPAIGN_PREFIX}:{${id}}`);
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
