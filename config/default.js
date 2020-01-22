'use strict';

module.exports = {
	app: 'sample-voting',
	log_level: 'debug',
	services: {
		redis: {
			redlock: {
				options: {
					// the expected clock drift; for more details
					// see http://redis.io/topics/distlock
					driftFactor: 0.01, // time in ms
					retryCount: 5,
					retryDelay: 100, // time in ms
					// the max time in ms randomly added to retries
					// to improve performance under high contention
					// see https://www.awsarchitectureblog.com/2015/03/backoff.html
					retryJitter: 100 // time in ms
				},
				ttl: {
					vote: 3000
				}
			}
		}
	}
};
