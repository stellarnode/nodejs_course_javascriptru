const { Server } = require('http');
const handleResponse = require('./handleResponse.js');

const server = new Server(handleResponse);

server.listen(8000);
