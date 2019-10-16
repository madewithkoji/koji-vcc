/* eslint-disable no-undef */
const { assert, use } = require('chai');
const config = require('../dist/res/config.json');
const schema = require('./configSchema');
use(require('chai-json-schema'));

const badConfig = {};

describe('Obj::config', () => {
  it('check schema for false-positives', () => {
    assert.notJsonSchema(badConfig, schema);
  });
  it('satisfies schema', () => {
    assert.jsonSchema(config, schema);
  });
});
