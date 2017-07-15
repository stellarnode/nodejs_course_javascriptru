// Проблема отсутствующего catch и проглоченной ошибки

const fs = require('mz/fs');

// fs.open()
//   .then(() => {
//     fs.stat();
//   })
//   .then(stat => {
//     if (stat.isDirectory()) {
//       ...
//     } else {
//       ...
//     }
//   })

async function read(path) {
  const stat = await fs.stat(path);

  if (stat.isDirectory()) {
    const files = await fs.readdir(path);
    return files;
  } else {
    const content = await fs.readFile(path);
    return content;
  }
}

read(__dirname).then(console.log).catch(console.error);

// async function a() {}
//
// console.log(typeof a()) // undefined
