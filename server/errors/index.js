'use strict';

const ERROR_KEYS = {
	CONFLICT: Symbol('CONFLICT'),
	INTERNAL: Symbol('INTERNAL'),
	SCHEMA_VALIDATION_ERROR: Symbol('SCHEMA_VALIDATION_ERROR'),
	AUTH_ERROR: Symbol('AUTH_ERROR'),
	NOT_FOUND: Symbol('NOT_FOUND'),
	UNPROCESSABLE_ENTITY: Symbol('UNPROCESSABLE_ENTITY'),
	CANDIDATE_NAMES_CONFLICT: Symbol('CANDIDATE_NAMES_CONFLICT'),
	ALREADY_VOTED: Symbol('ALREADY_VOTED'),
	CAMPAIGN_NOT_FOUND: Symbol('CAMPAIGN_NOT_FOUND'),
	CANDIDATE_NOT_FOUND: Symbol('CANDIDATE_NOT_FOUND'),
	CAMPAIGN_INACTIVE: Symbol('CAMPAIGN_INACTIVE'),
	HKID_INVALID: Symbol('HKID_INVALID')
};

const HTTP_RESPONSES = {
	[ERROR_KEYS.CONFLICT]: {
		status: 409,
		meta_code: 40900,
		type: 'Conflict',
		message: 'Conflict.'
	},
	[ERROR_KEYS.CANDIDATE_NAMES_CONFLICT]: {
		status: 409,
		meta_code: 40901,
		type: 'CANDIDATE_NAMES_CONFLICT',
		message: 'Candidate names are conflict.'
	},
	[ERROR_KEYS.ALREADY_VOTED]: {
		status: 409,
		meta_code: 40902,
		type: 'ALREADY_VOTED',
		message: 'This HKID has already voted this campaign.'
	},
	[ERROR_KEYS.INTERNAL]: {
		status: 500,
		meta_code: 50000,
		type: 'InternalError',
		message: 'Internal Error.'
	},
	[ERROR_KEYS.AUTH_ERROR]: {
		status: 401,
		meta_code: 40100,
		type: 'AuthenticationError',
		message: 'Authentication Error.'
	},
	[ERROR_KEYS.NOT_FOUND]: {
		status: 404,
		meta_code: 40400,
		type: 'NotFound',
		message: 'Resource is not found.'
	},
	[ERROR_KEYS.CAMPAIGN_NOT_FOUND]: {
		status: 404,
		meta_code: 40401,
		type: 'NotFound',
		message: 'Campaign is not found.'
	},
	[ERROR_KEYS.CANDIDATE_NOT_FOUND]: {
		status: 404,
		meta_code: 40402,
		type: 'NotFound',
		message: 'Candidate is not found.'
	},
	[ERROR_KEYS.UNPROCESSABLE_ENTITY]: {
		status: 422,
		meta_code: 42200,
		type: 'UnprocessableEntity',
		message: 'Unprocessable Entity.'
	},
	[ERROR_KEYS.SCHEMA_VALIDATION_ERROR]: {
		status: 422,
		type: 'SchemaValidationError',
		meta_code: 42201,
		message: 'Schema Validation Error'
	},
	[ERROR_KEYS.CAMPAIGN_INACTIVE]: {
		status: 422,
		type: 'CAMPAIGN_INACTIVE',
		meta_code: 42202,
		message: 'Campaign is not in active date.'
	},
	[ERROR_KEYS.HKID_INVALID]: {
		status: 422,
		type: 'HKID_INVALID',
		meta_code: 42203,
		message: 'HKID is invalid.'
	}
};

class CustomError extends Error {
	/**
	 *
	 * @param {Symbol} key
	 */
	constructor(key) {
		super(key.toString());
		this.ERROR_KEY = key;
		this.details = [];
	}

	static create(key) {
		return new CustomError(key);
	}

	/**
	 *
	 * @param {*} path erroneous object path, e.g. "body.user.id", can be null
	 * @param {*} path_error_message
	 */
	withDetail(path, path_error_message = null) {
		this.details.push({
			path,
			info: path_error_message || HTTP_RESPONSES[this.ERROR_KEY].message
		});
		return this;
	}
}

const makeError = (...args) => CustomError.create(...args);

module.exports = {
	makeError,
	HTTP_RESPONSES,
	ERROR_KEYS
};
