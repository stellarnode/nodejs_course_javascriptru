// ЗАДАЧА - сделать readFile, возвращающее promise
const fs = require('fs');

// fs.readFile(filePath, (err, content) => {});

function readFile(filePath) {
  /* ваш код */
}

readFile(__filename).then(console.log, console.error);
