'use strict';

const _ = require('lodash');
const {NUMBER_OF_VOTES_PREFIX} = require('../../enums/redisKeys');

module.exports = function buildCampaignResource(db_campaign) {
	return Object.keys(db_campaign).reduce((result, key) => {
		return key.startsWith(NUMBER_OF_VOTES_PREFIX)
			? _.mergeWith(
					{},
					result,
					{
						candidates: [
							{
								name: key.replace(
									`${NUMBER_OF_VOTES_PREFIX}:`,
									''
								),
								number_of_votes: Number(db_campaign[key]),
								voted: false
							}
						]
					},
					(objValue, srcValue) => (objValue || []).concat(srcValue)
			  )
			: {
					...result,
					[key]: db_campaign[key]
			  };
	}, {});
};
