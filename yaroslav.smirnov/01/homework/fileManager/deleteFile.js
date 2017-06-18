const fs = require('fs');
const rootDir = require('../config').root;

module.exports = (req, res, pathname) => {

    fs.unlink(rootDir + pathname, (err) => {
        if (err) {
            console.error(err);
            res.statusCode = 404;
            res.statusMessage = 'File not found';
            res.end('File not found');
        }
        res.statusCode = 200;
        res.end('File successfully deleted.');
    });

};


