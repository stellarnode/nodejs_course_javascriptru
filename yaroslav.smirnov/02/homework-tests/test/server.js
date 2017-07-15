const config = require('config');
const server = require('../server');
const request = require('request');
const assert = require('assert');
const fs = require('fs');
const crypto = require('crypto');
const mime = require('mime');

describe('Server Tests:', () => {
  let app;

  let requestURL = `${config.get('host')}:${config.get('port')}`;
  console.log('Base Request URL ', requestURL);

  let publicFolder = config.get('publicRoot');
  let filesFolder = config.get('filesRoot');
  let filesFolderPath = config.get('filesRootPath');

  let testFileContent = "hello world";
  let testFileName = "test-test-test" + Date.now() + ".txt";

  // Initial set up for all tests

  before((done) => {
    app = server.listen(config.get('port'), done);
    fs.writeFileSync(`${filesFolder}/${testFileName}`, testFileContent);
  });

  after((done) => {
    app.close(done);
    fs.unlinkSync(`${filesFolder}/${testFileName}`);
  });

  // Testing reading files

  describe('Read Files from Server', () => {

    it('responds with correct success status code with request to /', (done) => {
      request(requestURL, (err, response, body) => {
        if (err) {
          console.error(err);
          return done();
        }
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('servers index.html with GET request to /', (done) => {
      request(requestURL, (err, response, body) => {
        if (err) {
          console.error(err);
          return done();
        }
        const fileContent = fs.readFileSync(publicFolder + '/index.html');
        assert.equal(body, fileContent);
        done();
      });
    });

    it('responds with correct success status code if file exists', (done) => {
      request(`${requestURL}/${testFileName}`, (err, res, body) => {
        if (err) {
          console.error(err);
          return done();
        }
        assert.equal(res.statusCode, 200);
        done();
      });
    });

    it('GETs and server content of an existing file from Files folder', (done) => {
      request(`${requestURL}/${testFileName}`, (err, res, body) => {
        if (err) {
          console.error(err);
          return done();
        }
        assert.equal(body, testFileContent);
        done();
      });
    });

    it('provides correct MIME type in headers', (done) => {
      let fileMIME = mime.lookup(`${filesFolder}/${testFileName}`);
      request(`${requestURL}/${testFileName}`, (err, res, body) => {
        if (err) {
          console.error(err);
          return done();
        }
        assert.equal(res.headers['content-type'], fileMIME);
        done();
      });

    });

    it('reports if requested file does not exist', (done) => {
      let testFileNameHash = crypto.createHash('sha256').update(testFileName).digest('hex');
      request(`${requestURL}/${testFileNameHash}.${testFileNameHash}`, (err, res, body) => {
        if (err) {
          console.error(err);
          return done();
        }
        assert.equal(res.statusCode, 404);
        done();
      });
    });

    // it('responds with status 500 if server error', (done) => {

    //   //TODO: Have to think how to simulate server error

    //   // request(`${requestURL}/${testFileName}`, (err, res, body) => {
    //   //   if (err) {
    //   //     console.error(err);
    //   //     return done();
    //   //   }

    //   //   assert.equal(res.statusCode, 500);

    //   //   done();
    //   // });
    //   done();
    // });

  });

  // Testing writing files

  describe('Write Files to Server', () => {

    it('responds with status 413 if file is too big', (done) => {

      let file = fs.createReadStream(`${filesFolder}/${config.get('bigFile')}`);
      let upload = request.post(`${requestURL}/temp_${config.get('bigFile')}`, (err, res, body) => {
        if (err) {
          console.error('Error sending file: ', err);
          return done();
        }
      });

      // let emit = upload.emit;
      // upload.emit = function(event) {
      //   console.log(event);
      //   return emit.apply(this, arguments);
      // };

      upload.on('response', (res) => {
        assert(res.statusCode, 413);
        fs.unlinkSync(`${filesFolder}/temp_${config.get('bigFile')}`);
        done();
      });

      file.pipe(upload);
    });

    it('closes connection if file is too big', (done) => {

      let file = fs.createReadStream(`${filesFolder}/${config.get('bigFile')}`);
      let upload = request.post(`${requestURL}/temp_${config.get('bigFile')}`, (err, res, body) => {
        if (err) {
          console.error('Error sending file: ', err);
          return done();
        }
      });

      // let emit = upload.emit;
      // upload.emit = function(event) {
      //   console.log(event);
      //   return emit.apply(this, arguments);
      // };

      upload.on('response', (res) => {
        assert.equal(res.headers['connection'], 'close');
        done();
      });

      file.pipe(upload);
    });

    it('responds with status 200 if it accepts file for uploading', (done) => {

      let formData = {
        file: fs.createReadStream(`${filesFolder}/${testFileName}`)
      };

      request.post({url: `${requestURL}/temp_${testFileName}`, formData: formData}, (err, res, body) => {
        if (err) {
          console.error(err);
          return done();
        }
        assert.equal(res.statusCode, 200);
        fs.unlinkSync(`${filesFolder}/temp_${testFileName}`);
        done();
      });

    });

    it('saves accepted file correctly to the Files folder', (done) => {

      let initialFile = fs.readFileSync(`${filesFolder}/${testFileName}`);
      let upload = request.post(`${requestURL}/temp_${testFileName}`);
      let savedFile;

      fs.createReadStream(`${filesFolder}/${testFileName}`).pipe(upload);

      upload.on('complete', () => {
        savedFile = fs.readFileSync(`${filesFolder}/temp_${testFileName}`);
        assert.deepEqual(initialFile, savedFile);
        fs.unlinkSync(`${filesFolder}/temp_${testFileName}`);
        done();
      });

    });

    it('does not accept files if a file with the same name already exists', (done) => {

      request.post({url: `${requestURL}/${testFileName}`}, (err, res, body) => {
        if (err) {
          console.error(err);
          return done();
        }
        assert.equal(res.statusCode, 409);
        done();
      });
    });

  });

});
