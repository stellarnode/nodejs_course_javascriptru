/*
  unit
  integration !!
  functional/e2e
*/

/*
regression, smoke, generative, stress
*/

// mocha, jasmine, tape, jest, ...
// chai, should, assert, expect, ...

const server = require('../server');
const request = require('request');
const assert = require('assert');
const fs = require('fs');

describe('server tests', () => {
  let app;

  before((done) => {
    app = server.listen(1313, done);
  });

  after((done) => {
    app.close(done);
  });

  it('GET index.html', (done) => {
    /*
      1. запускаете сервер
      2. делаете запрос на /
      3. дожидаетесь ответа
      4а. статус 200?
      4б. прочитать index.html файл с диска
      5. сравнить то, что пришло с тем, что прочли
      6. остановить сервер
    */

    request('http://localhost:1313', (error, response, body) => {
      if (error) return done(error);

      assert.equal(response.statusCode, 500);

      const fileContent = fs.readFileSync('public/index.html');

      assert.equal(body, fileContent);

      done();
    });
  });
});
