const http = require('http');
const url = require('url');
const fileManager = require('./fileManager');

const server = new http.Server();

server.on('request', (req, res) => {

  let parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  if (pathname === '/' && req.method === 'GET') {
    fileManager.readFile(req, res, '/index.html');

  } else if (pathname.indexOf('/files/') > -1) {
    console.log(req.method);

    switch(req.method) {

      case 'GET':
        fileManager.readFile(req, res, pathname);
        break;

      case 'POST':
        fileManager.createFile(req, res);
        break;

      case 'DELETE':
        fileManager.deleteFile(req, res, pathname);
        break;

      default:
        res.end('What do you want to do?');
    }
  }
});

server.listen(3000);
