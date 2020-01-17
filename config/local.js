'use strict';

const _ = require('lodash');

const {NODE_ENV, PORT, REDIS_CLUSTER_IPS} = process.env;

const env = NODE_ENV;
const port = PORT;
const redis_nodes = REDIS_CLUSTER_IPS && JSON.parse(REDIS_CLUSTER_IPS);

module.exports = _.omitBy(
	{
		env,
		port,
		services: redis_nodes && {
			redis: {
				nodes: redis_nodes
			}
		}
	},
	_.isUndefined
);
