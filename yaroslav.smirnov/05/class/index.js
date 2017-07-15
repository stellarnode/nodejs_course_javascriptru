// title
//   [A-Z]
//
//   26 servers
//
//   1 server  - A
//   ...
//   26 server - Z
//
//   findWebsite('amazon') -> server 1
//
//   большой телевизор
//
//
// const arr = [
//   { "_id" : "59569ccbf031d03385747046", "name" : "ivan", "surname" : "ivanov", "age" : 20 }
//   { "_id" : "59569d1af031d03385747047", "name" : "masha", "city" : "moscow" }
// ];
// // 59569ccbf031d03385747046
// const usersById = {
//   '59569ccbf031d03385747046': arr[0],
//   '59569d1af031d03385747047': arr[1],
// }
// const usersByEmail = {
//   email1:
// }
// const ivan = usersById['59569ccbf031d03385747046']
const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({name: String}));

const vasya = new User({name: 'vasya'});

console.log(vasya instanceof User);
