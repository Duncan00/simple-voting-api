'use strict';

const moment = require('moment');

module.exports = function isActiveCampaign({start_date, end_date}) {
	return moment
		.utc()
		.isBetween(moment.utc(start_date), moment.utc(end_date), 'days', '[]');
};
