// The following will work if you set environment variable
// NODE_PATH=.

// This way you don't have to use require('./test');

const test = require('test');

console.log(process.env.NODE_PATH);

console.log(test);
