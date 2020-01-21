'use strict';

const _ = require('lodash');
const {NUMBER_OF_VOTES_PREFIX} = require('../../enums/redisKeys');

module.exports = function buildCampaignResource(
	db_campaign,
	voted_candidate_map = []
) {
	return Object.keys(db_campaign).reduce((result, key) => {
		if (key.startsWith(NUMBER_OF_VOTES_PREFIX)) {
			const candidates = _.cloneDeep(result.candidates) || [];
			const name = key.replace(`${NUMBER_OF_VOTES_PREFIX}:`, '');
			candidates.push({
				name,
				number_of_votes: Number(db_campaign[key]),
				voted: Boolean(voted_candidate_map[name])
			});
			return {
				...result,
				candidates
			};
		} else {
			return {
				...result,
				[key]: db_campaign[key]
			};
		}
	}, {});
};
