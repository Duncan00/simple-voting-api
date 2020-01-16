'use strict';

module.exports = function throwIfFalsy(obj) {
	if (typeof obj !== 'object') {
		throw new Error(
			'please wrap you param in a {} so that the function knows the var name by object key'
		);
	}

	const falsy_values = Object.keys(obj).filter(k => !obj[k]);

	if (falsy_values.length > 0) {
		throw new Error(`variable is falsy: ${falsy_values.join(', ')}`);
	}
};
