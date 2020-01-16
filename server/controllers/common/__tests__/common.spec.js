'use strict';

const initServer = () => require('../../../initServer')();
const supertest = require('supertest');

describe('Common controller', () => {
	let server;
	beforeEach(async () => {
		jest.resetModules();
		server = await initServer();
	});
	afterEach(() => {
		server.close();
	});

	describe('whoami', () => {
		test('successfully call GET', async () => {
			const response = await supertest(server).get('/v1/whoami');
			expect(response.status).toEqual(200);
			expect(response.body).toMatchSnapshot('GET whoami success');
		});
	});
});
