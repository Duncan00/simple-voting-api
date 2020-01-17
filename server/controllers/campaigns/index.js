'use strict';

const post = require('./post');
const votes = require('./votes');

const campaignController = ({redis}) => ({
	post: post({redis}),
	votes: votes({redis})
});

module.exports = campaignController;
