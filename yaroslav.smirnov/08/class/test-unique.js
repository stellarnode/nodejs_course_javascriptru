// Альтернативное API mongoose: промисы
// Задача: создать юзеров параллельно?

const mongoose = require('mongoose');
mongoose.Promise = Promise;

mongoose.connect('mongodb://localhost/test');

const User = mongoose.model('User', new mongoose.Schema({
  email:   {
    type:     String,
    required: true,
    unique:   true
  },
  displayName: String
}));

async function main() {
  await User.remove();

  await User.create({email: 'john@don.com'});

  const john = await User.findOne({email: 'john@don.com'});
  john.displayName = 'John';

  await john.validate();

  await john.save();
}

main()
  .then(() => mongoose.disconnect())
  .catch(console.error);
