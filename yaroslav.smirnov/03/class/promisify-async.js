const fs = require('fs');
const util = require('util');

const stat = util.promisify(fs.stat);

async function calculateFileSizes(file1, file2) {
  const value = await 10;
  const file1Stat = await stat(file1);
  const file2Stat = await stat(file2);

  return file1Stat.size + file2Stat.size;
}
