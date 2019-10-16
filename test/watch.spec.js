/* eslint-disable no-undef */
const { assert } = require('chai');
const { readDirectory, findRootDirectory } = require('../src/tools');

const mockWatch = () => readDirectory(findRootDirectory());
describe('Fn::watch()', () => {
  const files = mockWatch();
  describe('#Returns list of file paths', () => {
    it('is an array of strings', () => {
      const isAllStrings = !files.some((filePath) => typeof filePath !== 'string');

      assert.isArray(files, 'Must return an array');
      assert.isAbove(files.length, 0, 'Must return a non-empty array');
      assert.isTrue(isAllStrings, 'File paths must be strings');
    });
  });
});
