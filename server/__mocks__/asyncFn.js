'use strict';

const util = require('util');

const asyncFn = fname =>
	jest.fn(async (...args) => {
		const msg = `unexpected call to ${fname} with (${util.inspect(
			{args},
			10
		)}), did you miss any mockImplementationOnce?`;
		throw new Error(msg);
	});

module.exports = asyncFn;
