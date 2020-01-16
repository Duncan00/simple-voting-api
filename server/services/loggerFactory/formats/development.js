'use strict';

const _ = require('lodash');
const colors = require('../colors');

const formatWinston = ({winston}) => {
	winston.addColors(colors);
	const format = winston.format.combine(
		winston.format.colorize(),
		// winston use mutable info objects
		winston.format(info => {
			// eslint-disable-next-line no-param-reassign
			info.severity = info.level.toUpperCase();
			// eslint-disable-next-line no-param-reassign
			delete info.level;
			return info;
		})(),
		winston.format.errors({stack: true}),
		winston.format.printf(info => {
			const final_info = _.omit(info, 'message', 'severity');
			const json = JSON.stringify(final_info, null, 2);
			let result = `[${info.severity.toLowerCase()}]: ${info.message}`;
			if (Object.keys(final_info).length !== 0) {
				result += `\n${json}`;
			}
			return result;
		})
	);
	return format;
};

module.exports = formatWinston;
