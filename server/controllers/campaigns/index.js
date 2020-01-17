'use strict';

const post = require('./post');

const campaignController = ({redis}) => ({
	post: post({redis})
});

module.exports = campaignController;
