'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('runner service', function() {
  it('registered the runners service', () => {
    assert.ok(app.service('runners'));
  });
});
