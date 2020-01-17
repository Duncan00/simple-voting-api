'use strict';

const _ = require('lodash');
const crypto = require('crypto');
const {ERROR_KEYS, makeError} = require('../../../errors');
const isValidHkid = require('./isValidHkid');
const isActiveCampaign = require('./isActiveCampaign');
const buildCampaignResource = require('../buildCampaignResource');
const {
	CAMPAIGN_PREFIX,
	NUMBER_OF_VOTES_PREFIX,
	VOTED_PREFIX
} = require('../../../enums/redisPrefix');

function post({redis}) {
	return async function create(ctx) {
		const {id: campaign_id} = ctx.params;
		const {hkid, candidate} = ctx.request.body;
		const {name} = candidate;

		// Validate HKID
		if (!isValidHkid(hkid)) {
			throw makeError(ERROR_KEYS.HKID_INVALID);
		}

		// Confirm campaign & candidate exist
		const campaign_record = await redis.hgetall(
			`${CAMPAIGN_PREFIX}:{${campaign_id}}`
		);
		if (!campaign_record || _.isEmpty(campaign_record)) {
			throw makeError(ERROR_KEYS.CAMPAIGN_NOT_FOUND);
		}
		if (
			campaign_record[`${NUMBER_OF_VOTES_PREFIX}:${name}`] === undefined
		) {
			throw makeError(ERROR_KEYS.CANDIDATE_NOT_FOUND);
		}

		// Validate campaign in active date
		if (!isActiveCampaign(campaign_record)) {
			throw makeError(ERROR_KEYS.CAMPAIGN_INACTIVE);
		}

		// Try to store hashed_hkid to redis SET data structure
		const hashed_hkid = crypto
			.createHash('sha256')
			.update(hkid)
			.digest('hex');

		// TODO: To prevent concurrent duplicated voting, create a lock

		// Check already voted
		const is_member_int = await redis.sismember(
			`${VOTED_PREFIX}:{${campaign_id}}`,
			hashed_hkid
		);
		if (is_member_int === 1) {
			throw makeError(ERROR_KEYS.ALREADY_VOTED);
		}

		// Everything alright, increment vote count
		await redis
			.multi()
			// Mark HKID voted this campaign
			.sadd(`${VOTED_PREFIX}:{${campaign_id}}`, hashed_hkid)
			// Mark HKID voted specific candidate in this this campaign
			.sadd(`${VOTED_PREFIX}:{${campaign_id}}:${name}`, hashed_hkid)
			// Increase vote count for  specific candidate
			.hincrby(
				`${CAMPAIGN_PREFIX}:{${campaign_id}}`,
				`${NUMBER_OF_VOTES_PREFIX}:${name}`,
				1
			)
			.exec();

		// TODO: Unlock after successfully voted

		// Query latest campaign
		// To fine tune performance, can use updated number of votes from redis.hincrby instead of extra query
		const updated_campaign_record = await redis.hgetall(
			`${CAMPAIGN_PREFIX}:{${campaign_id}}`
		);
		ctx.status = 201;
		ctx.body = buildCampaignResource(updated_campaign_record);
	};
}

module.exports = post;
