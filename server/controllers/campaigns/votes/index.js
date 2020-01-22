'use strict';

const post = require('./post');

const voteController = ({redis, redlock}) => ({
	post: post({redis, redlock})
});

module.exports = voteController;
