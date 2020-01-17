'use strict';

const moment = require('moment');

module.exports = function isActiveCampaign({start_date, end_date}) {
	return moment().isBetween(start_date, end_date, 'days', '[]');
};
