#!/usr/bin/env node

const spawn = require('cross-spawn');
const stream = require('stream');

const customStream = new stream.Writable();
customStream._write = data => console.log(data.toString());

const foo = spawn(`npx`, ['jest', '--reporters=./index.js'], (err, stdout, stderr) => );

foo.stdout.pipe(customStream);
