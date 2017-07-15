const path = require('path');

module.exports = {
  // secret data can be moved to env variables
  // or a separate config
  host: "localhost",
  port: 3000,
  secret: 'mysecret',
  root: process.cwd(),
  db: 'mongodb://localhost:27017/nodejs-course',
  test_db: 'mongodb://localhost:27017/test_db',
  dbConnectPath: path.join(process.cwd(), 'db'),
  modelsPath: path.join(process.cwd(), 'models')
};
