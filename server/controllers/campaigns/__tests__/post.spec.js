'use strict';

const supertest = require('supertest');
const initServer = () => require('../../../initServer')();
const getServerDependencyMocks = () =>
	require('../../../__mocks__/getServerDependencyMocks');

describe('POST /v1/campaigns', () => {
	let server;

	const campaign_record = {
		id: 'fa044192-db7e-4fd3-9334-c9344360286b',
		title: 'Who is the best NBA player in the history',
		start_date: '2019-01-01',
		end_date: '2019-01-31',
		'number_of_votes:Michael Jordan': '0',
		'number_of_votes:Tim Duncan': '0'
	};

	beforeEach(async () => {
		jest.resetModules();
		const {redis} = getServerDependencyMocks();
		redis.hmset.mockResolvedValueOnce(undefined);
		redis.hgetall.mockResolvedValueOnce(campaign_record);

		server = await initServer();
	});

	afterEach(() => {
		server.close();
	});

	describe('When all campaign names in request body are unique', () => {
		const request_body = {
			title: 'Who is the best NBA player in the history',
			start_date: '2019-01-01',
			end_date: '2019-01-31',
			candidates: [
				{
					name: 'Michael Jordan'
				},
				{
					name: 'Tim Duncan'
				}
			]
		};

		test('201 - Successfully created', async () => {
			const {body, status} = await supertest(server)
				.post(`/v1/campaigns`)
				.send(request_body);

			expect(body).toMatchSnapshot();
			expect(status).toEqual(201);
			const {redis} = getServerDependencyMocks();
			expect(redis.hmset.mock.calls).toMatchSnapshot('redis.hmset');
			expect(redis.hgetall.mock.calls).toMatchSnapshot('redis.hgetall');
		});
	});

	describe('When all campaign names in request body are not unique', () => {
		const request_body = {
			title: 'Who is the best NBA player in the history',
			start_date: '2019-01-01',
			end_date: '2019-01-31',
			candidates: [
				{
					name: 'Michael Jordan'
				},
				{
					name: 'Michael Jordan'
				}
			]
		};

		test('409 - Conflict', async () => {
			const {body, status} = await supertest(server)
				.post(`/v1/campaigns`)
				.send(request_body);

			expect(body).toMatchSnapshot();
			expect(status).toEqual(409);
		});
	});
});
