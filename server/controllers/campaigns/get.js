'use strict';

const moment = require('moment');
const buildCampaignResource = require('./buildCampaignResource');
const {
	CAMPAIGN_PREFIX,
	NUMBER_OF_VOTES_PREFIX,
	CAMPAIGN_END_DATE
} = require('../../enums/redisKeys');

function get({redis}) {
	return async function read(ctx) {
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

		ctx.status = 200;
		ctx.body = sorted_active_campaigns
			.concat(sorted_ended_db_campaigns)
			.map(buildCampaignResource);
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
			? result + campaign[key]
			: result;
	}, 0);
}

module.exports = get;
