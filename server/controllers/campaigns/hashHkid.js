'use strict';

const crypto = require('crypto');

module.exports = function hashHkid(hkid) {
	return crypto
		.createHash('sha256')
		.update(hkid)
		.digest('hex');
};
