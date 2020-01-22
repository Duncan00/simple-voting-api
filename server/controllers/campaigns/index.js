'use strict';

const post = require('./post');
const get = require('./get');
const votes = require('./votes');

const campaignController = ({redis, redlock}) => ({
	post: post({redis}),
	get: get({redis}),
	votes: votes({redis, redlock})
});

module.exports = campaignController;
