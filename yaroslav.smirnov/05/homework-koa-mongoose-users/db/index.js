const config = require('config');

const mongoose = require('mongoose');

mongoose.Promise = Promise;

if (process.env.NODE_ENV !== 'test') {
    mongoose.set('debug', true);
}  

const beautifyUnique = require('mongoose-beautiful-unique-validation');
mongoose.plugin(beautifyUnique);

mongoose.connect(config.get('db'));
console.log(`Connected to database: ${config.get('db')}`);

module.exports = mongoose;
