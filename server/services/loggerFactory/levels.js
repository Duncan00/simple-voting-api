'use strict';

// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
const levels = {
	emergency: 0,
	alert: 1,
	critical: 2,
	error: 3,
	warning: 4,
	notice: 5,
	info: 6,
	debug: 7
};

module.exports = levels;
