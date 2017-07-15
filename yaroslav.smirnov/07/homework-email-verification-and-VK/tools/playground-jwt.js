const jwt = require('jsonwebtoken');
const secret = 'mysimplesecret';
const User = require('./models/user');

async function main() {

    require('./libs/mongoose');

    let users = await User.find({});

    // THIS IS A STRING
    console.log(typeof(users[0].id));

    // THIS IS AN OBJECT
    console.log(users[0]._id);
    
    // console.log(users[0]._id.toString() === users[0].id.toString());

    let token = jwt.sign(users[0]._id, secret);
    console.log(token);

    let anotherToken = jwt.sign(users[0].id, secret);
    console.log(anotherToken);

    let foundUser = await User.findById(users[0]._id);

    // console.log(foundUser);

    let verifiedToken = jwt.verify(token, secret);
    let anotherVerifiedToken = jwt.verify(anotherToken, secret);
    console.log(verifiedToken);
    console.log(anotherVerifiedToken);
}

main();