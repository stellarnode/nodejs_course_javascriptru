const assert = require('assert');
const config = require('config');
const crypto = require('crypto');
const fs = require('fs');
const mime = require('mime');
const request = require('request');
const rp = require('request-promise').defaults({
  encoding: null,
  resolveWithFullResponse: true,
  simple: false
});
const server = require('../server');
const promisify = require('util').promisify;
const fsp = {
  readFile: promisify(fs.readFile),
  unlink: promisify(fs.unlink)
};

// Server tests

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

    it('responds with correct success status code with request to /', async () => {
      const response = await rp.get(requestURL);
      assert.equal(response.statusCode, 200);
    });

    it('servers index.html with GET request to /', async () => {
      const options = {
        url: requestURL,
        encoding: 'utf-8'
      };
      const response = await rp.get(options);
      const fileContent = fs.readFileSync(publicFolder + '/index.html');
      assert.equal(response.body, fileContent);
    });

    it('responds with correct success status code if file exists', async () => {
      const res = await rp.get(`${requestURL}/${testFileName}`);
      assert.equal(res.statusCode, 200);
    });

    it('GETs and serves content of an existing file from Files folder', async () => {
      const res = await rp.get(`${requestURL}/${testFileName}`);
      assert.equal(res.body, testFileContent);
    });

    it('provides correct MIME type in headers', async () => {
      const fileMIME = mime.lookup(`${filesFolder}/${testFileName}`);
      const res = await rp.get(`${requestURL}/${testFileName}`);
      assert.equal(res.headers['content-type'], fileMIME);
    });

    it('reports if requested file does not exist', async () => {
      const testFileNameHash = crypto.createHash('sha256').update(testFileName).digest('hex');
      const res = await rp.get(`${requestURL}/${testFileNameHash}.${testFileNameHash}`);
      assert.equal(res.statusCode, 404);
    });

  });

  // Testing writing files

  describe('Write Files to Server', () => {

    it('responds with status 413 if file is too big', async () => {
      let file = fs.createReadStream(`${filesFolder}/${config.get('bigFile')}`);
      let upload = await rp.post(`${requestURL}/temp_${config.get('bigFile')}`);

      // let emit = upload.emit;
      // upload.emit = function(event) {
      //   console.log(event);
      //   return emit.apply(this, arguments);
      // };

      upload.on('response', (res) => {
        assert(res.statusCode, 413);
        fs.unlinkSync(`${filesFolder}/temp_${config.get('bigFile')}`);
      });

      file.pipe(upload);
    });

    it('closes connection if file is too big', async () => {

      let file = fs.createReadStream(`${filesFolder}/${config.get('bigFile')}`);
      let upload = await rp.post(`${requestURL}/temp_${config.get('bigFile')}`);

      // let emit = upload.emit;
      // upload.emit = function(event) {
      //   console.log(event);
      //   return emit.apply(this, arguments);
      // };

      upload.on('response', (res) => {
        assert.equal(res.headers['connection'], 'close');
      });

      file.pipe(upload);
    });

    it('responds with status 200 if it accepts file for uploading', async () => {
      let formData = {
        file: fs.readFileSync(`${filesFolder}/${testFileName}`)
      };

      let res = await rp.post({url: `${requestURL}/temp_${testFileName}`, formData: formData});
      assert.equal(res.statusCode, 200);
      fs.unlinkSync(`${filesFolder}/temp_${testFileName}`);
    });



    it('saves accepted file correctly to the Files folder', (done) => {
      let initialFile = fs.readFileSync(`${filesFolder}/${testFileName}`);
      let upload = request.post(`${requestURL}/temp_${testFileName}`);

      // let emit = upload.emit;
      // upload.emit = function(event) {
      //   console.log(event);
      //   return emit.apply(this, arguments);
      // };

      fs.createReadStream(`${filesFolder}/${testFileName}`).pipe(upload);
      upload.on('complete', () => {
        let savedFile = fs.readFileSync(`${filesFolder}/temp_${testFileName}`);
        assert.deepEqual(initialFile, savedFile);
        fs.unlinkSync(`${filesFolder}/temp_${testFileName}`);
        done();
      });
    });

    // it.only('async/await: saves accepted file correctly to the Files folder', async () => {
    //   let initialFile = await fsp.readFile(`${filesFolder}/${testFileName}`);
    //   let formData = {
    //     file: initialFile
    //   };
    //   let upload = await rp.post({ url: `${requestURL}/temp_${testFileName}`, formData: formData });
    //   let savedFile = fs.readFileSync(`${filesFolder}/temp_${testFileName}`);
    //   assert.deepEqual(initialFile, savedFile);
    //   fs.unlinkSync(`${filesFolder}/temp_${testFileName}`);
    // });


    it('does not accept files if a file with the same name already exists', async () => {
      let res = await rp.post({url: `${requestURL}/${testFileName}`});
      assert.equal(res.statusCode, 409);
    });

  });

});
