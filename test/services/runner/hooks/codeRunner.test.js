'use strict';

const assert = require('assert');
const codeRunner = require('../../../../src/services/runner/hooks/codeRunner.js');

describe('runner codeRunner hook', function() {
  it('hook can be used', function() {
    const mockHook = {
      type: 'before',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    codeRunner()(mockHook);

    assert.ok(mockHook.codeRunner);
  });
});
