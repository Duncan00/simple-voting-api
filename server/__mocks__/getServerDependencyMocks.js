'use strict';

/**
 *  Setup mocks for system boundaries (third party, data storage, etc) for easier testing
 */

const mockRedis = require('./mockRedis');

require('./mockUuid');

module.exports = {
	redis: mockRedis
};
