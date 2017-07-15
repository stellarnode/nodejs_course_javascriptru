/*
  Readable, Writable, Transform, Duplex
*/

const fs = require('fs');

const stream = fs.createReadStream(__filename);

// __buffer: [] 64kb

// paused, flowing

// stream.pipe(streamOut)
stream.on('data', chunk => {
  console.log(chunk);
});

setTimeout(() => {
  stream.pause();
  stream.removeAllListeners();
}, 200);
// stream.resume() / stream.pause()

// ==========
// stream.on('readable', () => {
//   const chunk = stream.read()
// })
//
// stream.myProperty = 'myValue';
//
// (req, res) => {
//   req.headers
//   req.url
// }
