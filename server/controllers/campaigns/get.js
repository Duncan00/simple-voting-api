'use strict';

const _ = require('lodash');
const moment = require('moment');
const buildCampaignResource = require('./buildCampaignResource');
const isValidHkid = require('./isValidHkid');
const hashHkid = require('./hashHkid');
const {ERROR_KEYS, makeError} = require('../../errors');
const {
	CAMPAIGN_PREFIX,
	NUMBER_OF_VOTES_PREFIX,
	VOTED_PREFIX,
	CAMPAIGN_END_DATE
} = require('../../enums/redisKeys');

function get({redis}) {
	return async function read(ctx) {
		const {hkid} = ctx.request.query;
		// Validate HKID
		if (hkid && !isValidHkid(hkid)) {
			throw makeError(ERROR_KEYS.HKID_INVALID);
		}

		// Query campaign IDs not yet ended
		const end_of_today_ts = moment()
			.endOf('day')
			.format('X');
		const non_ended_ids = await redis.zrangebyscore(
			CAMPAIGN_END_DATE,
			end_of_today_ts,
			'+inf'
		);

		// Query campaign IDs ended
		const end_of_yesterday_ts = moment()
			.subtract(1, 'days')
			.endOf('day')
			.format('X');
		const sorted_asc_ended_ids = await redis.zrangebyscore(
			CAMPAIGN_END_DATE,
			'-inf',
			`${end_of_yesterday_ts}`
		);

		// Query campaigns from Redis
		const [
			non_ended_db_campaigns,
			sorted_ended_db_campaigns
		] = await Promise.all([
			getCampaignsByIds({redis}, non_ended_ids),
			getCampaignsByIds({redis}, sorted_asc_ended_ids)
		]);

		// Filtering & sorting for active campaigns
		const sorted_active_campaigns = non_ended_db_campaigns
			// Filter out not yet start campaigns
			.filter(campaign =>
				moment().isSameOrAfter(campaign.start_date, 'days')
			)
			// Sort by voted count for active campaigns
			.sort(
				(campaign_a, campaign_b) =>
					getTotalNumberOfVotes(campaign_b) -
					getTotalNumberOfVotes(campaign_a)
			);

		const sorted_campaigns = sorted_active_campaigns.concat(
			sorted_ended_db_campaigns
		);
		if (hkid) {
			// Find back votes of this HKID in each campaign
			const hashed_hkid = hashHkid(hkid);
			const campaigns = await Promise.all(
				sorted_campaigns.map(async db_campaign => {
					const voted = await redis.sismember(
						`${VOTED_PREFIX}:{${db_campaign.id}}`,
						hashed_hkid
					);
					if (voted) {
						// Find out this HKID hash voted which candidate
						const names = getCandidateNames(db_campaign);
						const voted_candidates = await Promise.all(
							names.map(async name => {
								const candidate_voted = await redis.sismember(
									`${VOTED_PREFIX}:{${db_campaign.id}}:${name}`,
									hashed_hkid
								);
								return {
									[name]: Boolean(candidate_voted)
								};
							})
						);
						const voted_candidate_map = _.merge(
							{},
							...voted_candidates
						);
						return buildCampaignResource(
							db_campaign,
							voted_candidate_map
						);
					} else {
						return buildCampaignResource(db_campaign);
					}
				})
			);
			ctx.status = 200;
			ctx.body = {
				campaigns
			};
		} else {
			ctx.status = 200;
			ctx.body = {
				campaigns: sorted_campaigns.map(buildCampaignResource)
			};
		}
	};
}

async function getCampaignsByIds({redis}, ids) {
	return Promise.all(
		ids
			.reverse()
			.map(async id => redis.hgetall(`${CAMPAIGN_PREFIX}:{${id}}`))
	);
}

function getTotalNumberOfVotes(campaign) {
	return Object.keys(campaign).reduce((result, key) => {
		return key.startsWith(NUMBER_OF_VOTES_PREFIX)
			? result + Number(campaign[key])
			: result;
	}, 0);
}

function getCandidateNames(db_campaign) {
	return Object.keys(db_campaign)
		.filter(key => key.startsWith(NUMBER_OF_VOTES_PREFIX))
		.map(voted_field =>
			voted_field.replace(`${NUMBER_OF_VOTES_PREFIX}:`, '')
		);
}

module.exports = get;
