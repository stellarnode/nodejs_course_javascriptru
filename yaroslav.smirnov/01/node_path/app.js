// The following will work if you set environment variable
// NODE_PATH=.

// This way you don't have to use require('./test');

console.log(process.env.NODE_PATH);

const test = require('test');

console.log(test);
