'use strict';

const supertest = require('supertest');
const getServerDependencyMocks = () =>
	require('../../../__mocks__/getServerDependencyMocks');
const initServer = () => require('../../../initServer')();

describe('Common controller', () => {
	let server;
	beforeEach(async () => {
		jest.resetModules();
		getServerDependencyMocks();
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
