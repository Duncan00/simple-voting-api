'use strict';

const _ = require('lodash');
const {NUMBER_OF_VOTES_PREFIX} = require('../../enums/redisPrefix');

module.exports = function buildCampaignRecord({
	id,
	title,
	start_date,
	end_date,
	candidates
}) {
	return _.reduce(
		candidates,
		(result, candidate) => ({
			...result,
			[`${NUMBER_OF_VOTES_PREFIX}:${candidate.name}`]: 0
		}),
		{
			id,
			title,
			start_date,
			end_date
		}
	);
};
