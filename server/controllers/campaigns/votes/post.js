'use strict';

const _ = require('lodash');
const config = require('config');
const {ERROR_KEYS, makeError} = require('../../../errors');
const isValidHkid = require('../isValidHkid');
const hashHkid = require('../hashHkid');
const isActiveCampaign = require('./isActiveCampaign');
const buildCampaignResource = require('../buildCampaignResource');
const {
	CAMPAIGN_PREFIX,
	NUMBER_OF_VOTES_PREFIX,
	VOTED_PREFIX
} = require('../../../enums/redisKeys');

function post({redis, redlock}) {
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

		// Hash HKID to not keep HKID directly
		const hashed_hkid = hashHkid(hkid);

		// To prevent concurrent duplicated voting, lock by hkid with campaign_id
		let lock;
		try {
			lock = await redlock.lock(
				`locks:hkid:${hashed_hkid}:campaign:${campaign_id}`,
				config.services.redis.redlock.ttl.vote
			);
		} catch (e) {
			if (e.name === 'LockError') {
				throw makeError(ERROR_KEYS.VOTE_LOCKED);
			} else {
				throw e;
			}
		}

		try {
			// Check already voted
			const is_member = await redis.sismember(
				`${VOTED_PREFIX}:{${campaign_id}}`,
				hashed_hkid
			);
			if (is_member) {
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
		} finally {
			// Unlock after successfully voted or any errors asynchronously
			if (lock) {
				lock.unlock().catch(ctx.logger.error);
			}
		}

		// Query latest campaign
		// To fine tune performance, can use updated number of votes from redis.hincrby instead of extra query
		const updated_campaign_record = await redis.hgetall(
			`${CAMPAIGN_PREFIX}:{${campaign_id}}`
		);
		ctx.status = 201;
		ctx.body = buildCampaignResource(updated_campaign_record, {
			[name]: true
		});
	};
}

module.exports = post;
