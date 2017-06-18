const fs = require('fs');
const rootDir = require('../config').root;

module.exports = (req, res, pathname) => {
    console.log(__dirname + pathname);
    let file = fs.createReadStream(rootDir + pathname)
        .on('error', (err) => {
            console.error(err);
            res.statusCode = 404;
            res.end('File not found.');
        })
        .pipe(res);
          
    res.on('close', () => {
        file.destroy();
    });
};