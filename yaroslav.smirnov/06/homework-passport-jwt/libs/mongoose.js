/**
 * This file must be required at least ONCE.
 * After it's done, one can use require('mongoose')
 *
 * In web-app: ctx is done at init phase
 * In tests: in mocha.opts
 * In gulpfile: in beginning
 */

const mongoose = require('mongoose');
const config = require('config');
mongoose.Promise = Promise;

if (config.mongoose.debug) {
  mongoose.set('debug', true);
}

const beautifyUnique = require('mongoose-beautiful-unique-validation');
mongoose.plugin(beautifyUnique);

mongoose.connect(config.mongoose.uri, config.mongoose.options);

module.exports = mongoose;
