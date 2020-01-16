'use strict';

const {mergeSchemas} = require('swagger-ajv').utils;

module.exports = mergeSchemas(__dirname);
