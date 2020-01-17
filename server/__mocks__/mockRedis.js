'use strict';

const Redis = require('ioredis-mock');
const redis = new Redis();
// const asyncFn = require('./asyncFn');
//
// const redis = {
// 	mock_object_name: 'mock-redis-object',
// 	incr: asyncFn('redis#incr'),
// 	get: asyncFn('redis#get'),
// 	hmset: asyncFn('redis#hmset'),
// 	hgetall: asyncFn('redis#hgetall'),
// 	sismember: asyncFn('redis#sismember'),
// 	sadd: asyncFn('redis#sadd'),
// 	hincrby: asyncFn('redis#hincrby'),
// 	ping: asyncFn('redis#ping'),
// 	on: asyncFn('redis#on')
// };
const getRedis = jest.fn().mockResolvedValue(redis);
jest.doMock('../services/redis/getRedis', () => getRedis);

module.exports = redis;
