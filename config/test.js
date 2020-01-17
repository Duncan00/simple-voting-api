'use strict';

module.exports = {
	services: {
		redis: {
			nodes: JSON.parse(
				'[{"host": "127.0.0.1", "port": 7000}, {"host": "127.0.0.1", "port": 7001}, {"host": "127.0.0.1", "port": 7002}]'
			)
		}
	}
};
