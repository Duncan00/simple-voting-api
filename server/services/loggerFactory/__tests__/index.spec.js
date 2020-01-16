'use strict';

const {NODE_ENVS} = require('../../../enums/nodeEnvs');
const loggerFactory = require('../index');
const winston = require('winston');

describe('loggerFactory', () => {
	describe('every env has its format file', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			jest.spyOn(winston, 'createLogger');
		});
		Object.values(NODE_ENVS).forEach(env => {
			test(`logger for env: ${env}, expect no error thrown`, () => {
				const logger = loggerFactory({
					winston,
					log_level: 'info',
					env
				});
				logger.info({
					random_key: 'asdg',
					message: 'the call should not break the test'
				});
			});
		});
	});
});
