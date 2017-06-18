const fs = require('fs');
const rootDir = require('../config').root;
const filesFolder = require('../config').filesFolder;
const formidable = require('formidable');
const path = require('path');
const util = require('util');

module.exports = (req, res) => {

    let form = new formidable.IncomingForm();
    form.uploadDir = path.join(rootDir, '/tmp');

    form.on('progress', (bytesReceived, bytesExpected) => {
        if (bytesReceived > 1024 * 1024) {
            res.statusCode = 400;
            res.end('We only support files up to 1Mb in size. This one is ' + (bytesExpected/(1024 * 1024)).toFixed(2) + 'Mb.');
            req.destroy();

            fs.readdir(path.join(rootDir, '/tmp'), (err, files) => {
                if (err) console.error(err);
                for (const file of files) {
                    fs.unlink(path.join(path.join(rootDir, '/tmp'), file), (err) => {
                        if (err) console.error(err);
                    });
                }
            });
        }
    });

    form.on('file', (field, file) => {
        fs.stat(filesFolder + file.name, (err, stats) => {
            if (err) {
                fs.rename(file.path, path.join(filesFolder, file.name), (err) => {
                    if (err) console.error(err);
                });
                res.statusCode = 201;
                res.end('File uploaded successfully.');
            } else {
                console.log(filesFolder + file.name);
                res.statusCode = 304;
                fs.unlink(file.path);
                res.end('File with this name already exists.');
            }
        });
        
    });

    form.on('error', (err) => {
        console.error(err);
    });

    form.parse(req);

};