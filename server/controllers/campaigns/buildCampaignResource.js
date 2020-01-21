'use strict';

const _ = require('lodash');
const {NUMBER_OF_VOTES_PREFIX} = require('../../enums/redisKeys');

module.exports = function buildCampaignResource(db_campaign) {
	return Object.keys(db_campaign).reduce((result, key) => {
		if (key.startsWith(NUMBER_OF_VOTES_PREFIX)) {
			const candidates = _.cloneDeep(result.candidates) || [];
			candidates.push({
				name: key.replace(`${NUMBER_OF_VOTES_PREFIX}:`, ''),
				number_of_votes: Number(db_campaign[key]),
				voted: false
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
