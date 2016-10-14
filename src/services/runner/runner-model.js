'use strict';

// runner-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responseSchema = new Schema({
  stdout: { type: String, required: false },
  stderr: { type: String, required: false },
  exitCode: { type: Number, required: false },
  wallTime: { type: Number, required: false },
  stderrEscaped: { type: Boolean, required: false }
});

const runnerSchema = new Schema({
  code: { type: String, required: true },
  fixture: { type: String, required: false },
  response: responseSchema,
  setup: { type: String, required: false },
  language: { type: String, required: false },
  languageVersion: { type: String, required: false },
  testFramework: { type: String, required: false, default: 'cw' },
  timeout: { type: Number, required: true, default: 5000 },
  format: { type: String, required: true, default: 'json' },
  studentId: { type: Number, required: false },
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});

const runnerModel = mongoose.model('runner', runnerSchema);

module.exports = runnerModel;
