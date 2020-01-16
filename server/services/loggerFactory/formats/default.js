'use strict';

const formatWinston = ({winston}) => {
	return winston.format.combine(
		/* eslint no-param-reassign: 0 */
		winston.format(info => {
			info.severity = info.level.toUpperCase();
			delete info.level;
			return info;
		})(),
		winston.format.errors({stack: true}),
		winston.format.json({
			replacer: (key, value) => {
				if (key === 'password') return '***';
				return Buffer.isBuffer(value)
					? value.toString('base64')
					: value;
			}
		})
	);
};

module.exports = formatWinston;
