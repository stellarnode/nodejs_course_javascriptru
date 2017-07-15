const fs = require('fs');

// хотим читать данные из потока в цикле
function readStream(stream) {

  let counter = 0;
  stream.pause();
  console.log("Stream State: ", (stream.isPaused() ? "PAUSED" : "FLOWING"));

  return function() {

    let defer = new Promise((resolve, reject) => {
      stream.push();
      stream.pause();
      let chunk;

      stream.once('readable', () => {
        counter++;
        chunk = stream.read();
        console.log('\n\n--- READ CHUNK #', counter, '---');
        if (chunk) {
          resolve(chunk);
        } else {
          reject(chunk);
        }
      });
    });

    return defer;
  };

}


async function read(path) {

  let stream = fs.createReadStream(path, {highWaterMark: 60, encoding: 'utf-8'});

  let data;

  // ЗАДАЧА: написать такой readStream
  let reader = readStream(stream);

  while(data = await reader()) {
    console.log(data);
  }

}

read(__filename).catch(console.error);
