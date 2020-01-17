'use strict';

// make uuid predictable in snapshots
jest.mock('uuid/v4', () => {
	let count = 0;
	return () => `uuid-${count++}`;
});
