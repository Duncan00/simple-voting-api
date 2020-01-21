'use strict';

const supertest = require('supertest');
const _ = require('lodash');
const mockdate = require('mockdate');
const initServer = () => require('../../../initServer')();
const getServerDependencyMocks = () =>
	require('../../../__mocks__/getServerDependencyMocks');

describe('POST /v1/campaigns', () => {
	let server;

	beforeEach(async () => {
		jest.resetModules();
		getServerDependencyMocks();
		mockdate.set('2019-01-01');
		server = await initServer();
	});

	afterEach(() => {
		server.close();
		mockdate.reset();
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

			const {id: campaign_id} = body.data;
			const {redis} = getServerDependencyMocks();
			const inserted_campaign = await redis.hgetall(
				`campaign:{${campaign_id}}`
			);
			expect(inserted_campaign).toMatchSnapshot('inserted_campaign');

			const hkid_set = await redis.smembers(`voted:{${campaign_id}}`);
			expect(hkid_set).toMatchSnapshot('hkid_set');

			const hkid_set_ttl = await redis.ttl(`voted:{${campaign_id}}`);
			expect(hkid_set_ttl).toMatchSnapshot('hkid_set_ttl');

			const hkid_candidate_sets = await Promise.all(
				_.map(request_body.candidates, async candidate =>
					redis.smembers(`voted:{${campaign_id}}:${candidate.name}`)
				)
			);
			expect(hkid_candidate_sets).toMatchSnapshot(`hkid_candidate_sets`);

			const hkid_candidate_set_ttls = await Promise.all(
				_.map(request_body.candidates, async candidate =>
					redis.ttl(`voted:{${campaign_id}}:${candidate.name}`)
				)
			);
			expect(hkid_candidate_set_ttls).toMatchSnapshot(
				`hkid_candidate_set_ttls`
			);
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
