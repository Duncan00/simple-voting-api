'use strict';

const isValidHkid = require('../isValidHkid');

describe('isValidHkid', () => {
	describe('When validate against valid HKID with 1 char and 7 digits', () => {
		test('should return true', async () => {
			const hkid = 'A123456(3)';

			const result = await isValidHkid(hkid);

			expect(result).toBeTruthy();
		});
	});

	describe('When validate against valid HKID with 2 chars and 7 digits', () => {
		test('should return true', async () => {
			const hkid = 'AB987654(3)';

			const result = await isValidHkid(hkid);

			expect(result).toBeTruthy();
		});
	});

	describe('When validate against invalid HKID', () => {
		test('should return false', async () => {
			const hkid = 'A123456(7)';

			const result = await isValidHkid(hkid);

			expect(result).toBeFalsy();
		});
	});
});
