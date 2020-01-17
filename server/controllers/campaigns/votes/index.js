'use strict';

const post = require('./post');

const voteController = ({redis}) => ({
	post: post({redis})
});

module.exports = voteController;
