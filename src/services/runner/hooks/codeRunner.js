'use strict';

// src/services/runner/hooks/codeRunner.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

const defaults = {};

const run = require('../../../../lib/runner').run;

const runCode = data =>  {
  let {
    code,
    fixture,
    setup,
    language,
    languageVersion,
    testFramework,
    timeout,
    format,
  } = data;

  const opts = Object.assign({}, {
    code,
    fixture,
    setup,
    language,
    languageVersion,
    testFramework,
    timeout,
    format,
  }, {
    testFramework: 'cw',
    timeout: 5000,
    format: 'json',
  });

  return run(opts);
};

module.exports = function(options) {
  options = Object.assign({}, defaults, options);

  return function(hook) {
    // Run the code and assign the response data
    hook.data = Object.assign({}, hook.data, {
      response: runCode(hook.data)
    });
  };
};
