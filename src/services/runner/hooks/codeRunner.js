'use strict';

// src/services/runner/hooks/codeRunner.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

const defaults = {};

const run = require('../../../../lib/runner').run;

const runCode = (data) =>  {
  const opts = Object.assign({}, {
    code: data.code,
    fixture: data.fixture,
    setup: data.setup,
    language: data.language,
    languageVersion: data.languageVersion,
    testFramework: data.testFramework || 'cw',
    timeout: data.timeout,
    format: data.format,
  }, {
    timeout: 5000,
    format: 'default'
  });

  return new Promise((cb) => {
    return run(opts, cb);
  });
};

module.exports = function(options) {
  options = Object.assign({}, defaults, options);

  return function(hook) {
    return runCode(hook.data)
    .then((response) => {
      hook.data = Object.assign({}, hook.data, {
        response: response
      });
      return hook;
    });
  };
};
