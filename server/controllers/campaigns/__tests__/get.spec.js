'use strict';

const moment = require('moment');
const supertest = require('supertest');
const _ = require('lodash');
const mockdate = require('mockdate');
const initServer = () => require('../../../initServer')();
const getServerDependencyMocks = () =>
	require('../../../__mocks__/getServerDependencyMocks');
const hashHkid = require('../hashHkid');

describe('GET /v1/campaigns', () => {
	let server;

	const campaign_records = [
		{
			id: '1a044192-db7e-4fd3-9334-c9344360286b',
			title: 'Current campaign 1',
			start_date: '2019-01-01',
			end_date: '2019-01-31',
			'number_of_votes:Michael Jordan': '0',
			'number_of_votes:Tim Duncan': '99'
		},

		{
			id: '2a044192-db7e-4fd3-9334-c9344360286b',
			title: 'Current campaign 2',
			start_date: '2019-01-01',
			end_date: '2019-01-31',
			'number_of_votes:Michael Jordan': '100',
			'number_of_votes:Tim Duncan': '0'
		},

		{
			id: '3a044192-db7e-4fd3-9334-c9344360286b',
			title: 'Current campaign 3',
			start_date: '2019-01-01',
			end_date: '2019-01-31',
			'number_of_votes:Michael Jordan': '50',
			'number_of_votes:Tim Duncan': '51'
		},

		{
			id: 'aa044192-db7e-4fd3-9334-c9344360286b',
			title: 'Old campaign 1',
			start_date: '2018-11-01',
			end_date: '2018-11-30',
			'number_of_votes:Michael Jordan': '100000',
			'number_of_votes:Tim Duncan': '0'
		},

		{
			id: 'ba044192-db7e-4fd3-9334-c9344360286b',
			title: 'Old campaign 2',
			start_date: '2018-12-01',
			end_date: '2018-12-31',
			'number_of_votes:Michael Jordan': '200',
			'number_of_votes:Tim Duncan': '0'
		},

		{
			id: 'fa044192-db7e-4fd3-9334-c9344360286b',
			title: 'Future campaign',
			start_date: '2019-02-01',
			end_date: '2019-02-28',
			'number_of_votes:Michael Jordan': '0',
			'number_of_votes:Tim Duncan': '0'
		}
	];

	const hkid = 'A123456(3)';
	const hashed_hkid = hashHkid(hkid);

	beforeEach(async () => {
		jest.resetModules();
		mockdate.set('2019-01-01');
		const {redis} = getServerDependencyMocks();
		await Promise.all(
			campaign_records.map(async campaign_record => {
				return Promise.all([
					redis.hmset(
						`campaign:{${campaign_record.id}}`,
						campaign_record
					),
					redis.zadd(
						'campaign_end_date',
						moment
							.utc(campaign_record.end_date)
							.endOf('day')
							.format('X'),
						campaign_record.id
					)
				]);
			})
		);
		// Voted "Michael Jordan" at "Current campaign 2"
		await redis.sadd(
			`voted:{2a044192-db7e-4fd3-9334-c9344360286b}`,
			hashed_hkid
		);
		await redis.sadd(
			`voted:{2a044192-db7e-4fd3-9334-c9344360286b}:Michael Jordan`,
			hashed_hkid
		);

		server = await initServer();
	});

	afterEach(() => {
		server.close();
		mockdate.reset();
	});

	// TODO: Different combination of test cases should be added
	describe('When query without query strings', () => {
		test('200 - Responds a list of all campaigns started', async () => {
			const {body, status} = await supertest(server).get(`/v1/campaigns`);

			expect(body).toMatchSnapshot();
			expect(status).toEqual(200);
		});
	});

	describe('When query with hkid', () => {
		test('200 - Responds a list of all campaigns started', async () => {
			const {body, status} = await supertest(server).get(
				`/v1/campaigns?hkid=${hkid}`
			);

			expect(body).toMatchSnapshot();
			expect(status).toEqual(200);
		});
	});
});
