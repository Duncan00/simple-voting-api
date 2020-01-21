'use strict';

module.exports = function isValidHkid(hkid) {
	// regular expression to check pattern and split
	const hkid_pattern = /^([A-Z]{1,2})([0-9]{6})\(([A0-9])\)$/;
	const matches = hkid.match(hkid_pattern);

	// not match, return false
	if (matches === null) return false;

	// the character part, numeric part and check digit part
	const char_part = matches[1];
	const num_part = matches[2];
	const check_digit = matches[3];

	// calculate the checksum for character part
	const POSSIBLE_CHAR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let check_sum = 0;
	if (char_part.length === 2) {
		check_sum += 9 * (10 + POSSIBLE_CHAR.indexOf(char_part.charAt(0)));
		check_sum += 8 * (10 + POSSIBLE_CHAR.indexOf(char_part.charAt(1)));
	} else {
		check_sum += 9 * 36;
		check_sum += 8 * (10 + POSSIBLE_CHAR.indexOf(char_part));
	}

	// calculate the checksum for numeric part
	for (let i = 0, j = 7; i < num_part.length; i++, j--)
		check_sum += j * Number(num_part.charAt(i));

	// verify the check digit
	const remaining = check_sum % 11;
	const verify = remaining === 0 ? 0 : 11 - remaining;

	return (
		String(verify) === check_digit || (verify === 10 && check_digit === 'A')
	);
};
