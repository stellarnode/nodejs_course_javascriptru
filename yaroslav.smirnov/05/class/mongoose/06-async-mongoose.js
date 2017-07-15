// Альтернативное API mongoose: промисы
// Задача: создать юзеров параллельно?

const mongoose = require('mongoose');
mongoose.Promise = Promise;

mongoose.connect('mongodb://localhost/test');

const User = mongoose.model('User', new mongoose.Schema({
  email:   {
    type:     String,
    required: 'Поле email является обязательным!',
    unique:   true
  }
}));

async function createUsers() {

  // new User({..}).save()
  await User.remove({});
  let john = await User.create({});
  let pete = await User.create({email: 'pete@gmail.com'});
  let mary = await User.create({email: 'mary@gmail.com'});

}

// ВОПРОС: что будет при ошибке валидации?
// структура ошибки валидации: err.errors

createUsers()
  .then(() => console.log("done"))
  .catch((err) => {
    console.error(Object.keys(err.errors).map(key => {
      return [key, err.errors[key].message];
    }));
    // console.error(err);
  })
  .then(() => mongoose.disconnect());
