'use strict';

const throwIfFalsy = require('../throwIfFalsy');

describe('throwIfFalsy', () => {
	test('should throw if not object', () => {
		expect(() => {
			throwIfFalsy('not an object');
		}).toThrowErrorMatchingSnapshot('error snapshot - not an object');
	});

	test('should throw if object contains falsy values', () => {
		const obj = {
			valid: 'hello world!',
			invalid: null
		};

		expect(() => {
			throwIfFalsy(obj);
		}).toThrowErrorMatchingSnapshot(
			'error snapshot - object contains falsy'
		);
	});
});
