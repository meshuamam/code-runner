'use strict';

const service = require('feathers-mongoose');
const runner = require('./runner-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: runner,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/runners', service(options));

  // Get our initialize service to that we can bind hooks
  const runnerService = app.service('/runners');

  // Set up our before hooks
  runnerService.before(hooks.before);

  // Set up our after hooks
  runnerService.after(hooks.after);
};
