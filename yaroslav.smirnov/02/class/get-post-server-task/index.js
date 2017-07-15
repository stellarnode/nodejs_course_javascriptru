/**
 ЗАДАЧА
 Написать HTTP-сервер для загрузки и получения файлов
 - Все файлы находятся в директории files
 - Структура файлов НЕ вложенная.

 - Виды запросов к серверу
   GET /file.ext [image.png, video.mp4]
   - выдаёт файл file.ext из директории files,

   POST /file.ext
   - пишет всё тело запроса в файл files/file.ext и выдаёт ОК
   - если файл уже есть, то выдаёт ошибку 409
   - при превышении файлом размера 1MB выдаёт ошибку 413

   DELETE /file
   - удаляет файл
   - выводит 200 OK
   - если файла нет, то ошибка 404

 Вместо file может быть любое имя файла.
 Так как поддиректорий нет, то при наличии / или .. в пути сервер должен выдавать ошибку 400.

- Сервер должен корректно обрабатывать ошибки "файл не найден" и другие (ошибка чтения файла)
- index.html или curl для тестирования

 */

// Пример простого сервера в качестве основы

'use strict';

let url = require('url');
let fs = require('fs');
const path = require('path');
const mime = require('mime');


require('http').createServer(function(req, res) {

  let pathname = decodeURI(url.parse(req.url).pathname);
  let filename = pathname.slice(1); // /file.ext -> file.ext

  if (filename.includes('/') || filename.includes('..')) {
    res.statusCode = 400;
    res.end('Nested paths are not allowed');
    return;
  }

  if (req.method === 'GET') {
    if (pathname === '/') {
      sendFile('./public' + '/index.html', res);
    } else {
      let filepath = path.join('./files', filename);
      sendFile(filepath, res);
    }
  }


  if (req.method === 'POST') {

    if (!filename) {
      res.statusCode = 404;
      res.end('File not found');
    }

    receiveFile(path.join('./files', filename), req, res);

  }

}).listen(3000);

function sendFile(filePath, res) {
  /*
    --- 0. проверить есть ли файл
    1. создать объект потока
  */

  // [stat, delete, createReadStream]
  // fs.stat(filePath, (err, stat) => {
    // ...

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);

  stream.on('error', error => {
    if (error.code === 'ENOENT') {
      res.statusCode = 404;
      res.end('file not found');
    } else {
      // res.headersSent
      res.statusCode = 500;
      res.end('internal error');
    }
  });

  stream.on('open', () => {
    // res.writeHeader()
    res.setHeader('content-type', mime.lookup(filePath));
  });

  // req, res .on('error')

  res.on('close', () => {
    stream.destroy();
  });
}

function receiveFile(filepath, req, res) {
  // stat, exists, access, ...

  if (req.headers['content-length'] > 1024 * 1024) {
    res.statusCode = 413;
    res.end('file is too big');
    return;
  }

  const stream = fs.createWriteStream(filepath, {flags: 'wx'});
  req.pipe(stream);
  let size = 0;
  req.on('data', chunk => {
    size += chunk.length;

    if (size > 1024 * 1024) {
      res.statusCode = 413;
      res.end('file is too big');

      stream.destroy();
      fs.unlink(filepath, err => {
        if (err) console.log(err);
      });
    }
  });

  stream.on('error', error => {
    if (error.code === 'EEXIST') {
      res.statusCode = 409;
      res.end('file already exists');
    } else {
      res.statusCode = 500;
      res.end('internal error');

      fs.unlink(filepath, err => {
        if (err) console.log(err);
      });
    }
  });

  stream.on('close', () => {
    res.statusCode = 201;
    res.end('file created');
  });
}
