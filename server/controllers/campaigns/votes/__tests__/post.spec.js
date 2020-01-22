'use strict';

const supertest = require('supertest');
const _ = require('lodash');
const mockdate = require('mockdate');
const initServer = () => require('../../../../initServer')();
const getServerDependencyMocks = () =>
	require('../../../../__mocks__/getServerDependencyMocks');

describe('POST /v1/campaigns/:id/votes', () => {
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
		mockdate.set('2019-01-01');
		const {redis} = getServerDependencyMocks();
		await redis.hmset(`campaign:{${campaign_record.id}}`, campaign_record);
		server = await initServer();
	});

	afterEach(() => {
		server.close();
		mockdate.reset();
	});

	describe('When vote with valid input and valid date', () => {
		const request_body = {
			hkid: 'A123456(3)',
			candidate: {
				name: 'Michael Jordan'
			}
		};

		test('201 - Successfully created', async () => {
			const {body, status} = await supertest(server)
				.post(`/v1/campaigns/${campaign_record.id}/votes`)
				.send(request_body);

			expect(body).toMatchSnapshot();
			expect(status).toEqual(201);

			const {redis} = getServerDependencyMocks();
			const updated_campaign = await redis.hgetall(
				`campaign:{${campaign_record.id}}`
			);
			const voted_campaign_hkid_set = await redis.smembers(
				`voted:{${campaign_record.id}}`
			);
			const voted_candidate_hkid_set = await redis.smembers(
				`voted:{${campaign_record.id}}:${request_body.candidate.name}`
			);
			expect(updated_campaign).toMatchSnapshot('updated_campaign');
			expect(voted_campaign_hkid_set).toMatchSnapshot(
				'voted_campaign_hkid_set'
			);
			expect(voted_candidate_hkid_set).toMatchSnapshot(
				'voted_candidate_hkid_set'
			);
		});
	});

	describe('When vote with valid input and valid date concurrently', () => {
		const request_body = {
			hkid: 'A123456(3)',
			candidate: {
				name: 'Michael Jordan'
			}
		};

		test('201 - Successfully created for only 1 of the request', async () => {
			function genRequest() {
				return supertest(server)
					.post(`/v1/campaigns/${campaign_record.id}/votes`)
					.send(request_body);
			}

			const responses = await Promise.all([genRequest(), genRequest()]);

			expect(
				responses
					.map(res => ({status: res.status, body: res.body}))
					.sort()
			).toMatchSnapshot('responses');

			const {redis} = getServerDependencyMocks();
			const updated_campaign = await redis.hgetall(
				`campaign:{${campaign_record.id}}`
			);
			const voted_campaign_hkid_set = await redis.smembers(
				`voted:{${campaign_record.id}}`
			);
			const voted_candidate_hkid_set = await redis.smembers(
				`voted:{${campaign_record.id}}:${request_body.candidate.name}`
			);
			expect(updated_campaign).toMatchSnapshot('updated_campaign');
			expect(voted_campaign_hkid_set).toMatchSnapshot(
				'voted_campaign_hkid_set'
			);
			expect(voted_candidate_hkid_set).toMatchSnapshot(
				'voted_candidate_hkid_set'
			);
		});
	});

	describe('When vote with non-exist campaign_id', () => {
		const request_body = {
			hkid: 'A123456(3)',
			candidate: {
				name: 'Michael Jordan'
			}
		};

		test('404 - CAMPAIGN_NOT_FOUND', async () => {
			const non_exist_campaign_id =
				'e016e4f6-1b52-45ff-bced-79bbd8478a16';

			const {body, status} = await supertest(server)
				.post(`/v1/campaigns/${non_exist_campaign_id}/votes`)
				.send(request_body);

			expect(body).toMatchSnapshot();
			expect(status).toEqual(404);
		});
	});

	describe('When vote with non-exist candidate name', () => {
		const request_body = {
			hkid: 'A123456(3)',
			candidate: {
				name: 'Non-exist candidate'
			}
		};

		test('404 - CANDIDATE_NOT_FOUND', async () => {
			const {body, status} = await supertest(server)
				.post(`/v1/campaigns/${campaign_record.id}/votes`)
				.send(request_body);

			expect(body).toMatchSnapshot();
			expect(status).toEqual(404);
		});
	});

	describe('When vote with already voted HKID', () => {
		const request_body = {
			hkid: 'A123456(3)',
			candidate: {
				name: 'Michael Jordan'
			}
		};

		test('409 - ALREADY_VOTED', async () => {
			const {redis} = getServerDependencyMocks();
			// hashed HKID
			redis.sadd(
				`voted:{${campaign_record.id}}`,
				'ff4147ac6a03a3bcf124f9f49bc12e2bf3c0b2abe029a4dfaab7c39ae1f98309'
			);
			mockdate.set('2019-01-01');

			const {body, status} = await supertest(server)
				.post(`/v1/campaigns/${campaign_record.id}/votes`)
				.send(request_body);

			expect(body).toMatchSnapshot();
			expect(status).toEqual(409);

			mockdate.reset();
		});
	});

	describe('When vote with invalid HKID', () => {
		const request_body = {
			hkid: 'A123456(A)',
			candidate: {
				name: 'Michael Jordan'
			}
		};

		test('422 - INVALID_HKID', async () => {
			const {body, status} = await supertest(server)
				.post(`/v1/campaigns/${campaign_record.id}/votes`)
				.send(request_body);

			expect(body).toMatchSnapshot();
			expect(status).toEqual(422);
		});
	});

	describe('When vote with invalid date', () => {
		const request_body = {
			hkid: 'A123456(A)',
			candidate: {
				name: 'Michael Jordan'
			}
		};

		test('422 - INVALID_DATE', async () => {
			const {redis} = getServerDependencyMocks();
			mockdate.set('2019-12-31');

			const {body, status} = await supertest(server)
				.post(`/v1/campaigns/${campaign_record.id}/votes`)
				.send(request_body);

			expect(body).toMatchSnapshot();
			expect(status).toEqual(422);
		});
	});
});
