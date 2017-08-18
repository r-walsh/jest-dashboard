#!/usr/bin/env node

const spawn = require('cross-spawn');
require('./');

const jest = spawn('npm', ['run', `jest --reporters=${__dirname}/testing.js`]);
