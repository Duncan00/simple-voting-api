'use strict';

const Redis = require('ioredis-mock');
const redis = new Redis();

const getRedis = jest.fn().mockResolvedValue(redis);
jest.doMock('../services/redis/getRedis', () => getRedis);

module.exports = redis;
