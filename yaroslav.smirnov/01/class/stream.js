const fs = require('fs');

// macroqueue: []
const stream = fs.createReadStream('sadl;fjas;hjfdashf'); // {on, pipe, }

stream.on('error', () => {});
