// Run tests with: NODE_ENV=test mocha **/*.test.js

const config = require('config');
const request = require('request');
const supertest = require('supertest');
const expect = require('expect');
const assert = require('assert');
const _ = require('lodash');

const { User } = require(config.get('modelsPath'));
const { server, app } = require('../index');
const mongoose = require(config.get('dbConnectPath'));

const rp = require('request-promise').defaults({
    encoding: null,
    resolveWithFullResponse: true,
    simple: false
});

describe('usersController:', () => {
    let app;
    let existingID;
    let nonExistingID;

    let requestURL = `http://${config.get('host')}:${config.get('port')}/users/`;
    console.log('Base Request URL ', requestURL);


    before(async () => {

        try {
            await User.remove({});
            console.log('Previous collection deleted.');
        } catch (err) {
            console.error(err);
        }

        let itUsers = [{
            _id: mongoose.Types.ObjectId(),
            email: "test@test.com",
            displayName: "test"
        }, {
            _id: mongoose.Types.ObjectId(),
            email: "admin@admin.com",
            displayName: "admin"
        }, {
            _id: mongoose.Types.ObjectId(),
            email: "star@star.com",
            displayName: "star"
        }];

        
        try {
            await User.insertMany(itUsers);
            console.log('Written test users into DB');
            existingID = await User.find({});
            existingID = existingID[0]._id
            nonExistingID = '123';
            console.log('Existing ID for tests: ', existingID);
            console.log('Non-existing ID for tests: ', nonExistingID);
            console.log('\n\n');
        } catch (err) {
            console.log(err);
        }

    });

    after(async () => {
        await User.remove({});
        server.close();
        mongoose.disconnect();
    });

    describe('GET /users', () => {

        it('returns array of users from the database', async () => {
            let response = await rp.get(requestURL);
            let users = await User.find();
            expect(response.body.toString()).toBe(JSON.stringify(users));
            // console.log(JSON.stringify(users));
            // console.log(response.body.toString());
        });
    });

    describe('GET /users/:id', () => {

        it('returns a user by ID', async () => {
            let user = await User.findById(existingID);
            let response = await rp.get(requestURL + existingID);
            expect(response.body.toString()).toBe(JSON.stringify(user));
        });

        it('responds with status 404 if user not found', async () => {
            let response = await rp.get(requestURL + nonExistingID);
            expect(response.statusCode).toBe(404);
        });

        it('returns "user not found" error if ID is invalid', async () => {
            let response = await rp.get(requestURL + nonExistingID);
            expect(JSON.parse(response.body).errors.server).toBe(`User with id ${nonExistingID} not found.`);
        });

    });

    describe('POST /users', () => {

        it('creates a new user', async () => {
            let newUser = { email: 'new@new.com', displayName: 'new' };
            let response = await rp.post({ url: requestURL, form: newUser });
            let user = await User.findOne({ email: 'new@new.com' });
            response = JSON.parse(response.body.toString());

            let fields = ['__v', 'email', 'displayName', '_id'];

            fields.forEach((field) => {
                if (field === '_id') {
                    expect(user[field].toString()).toBe(response[field]);
                } else {
                    expect(user[field]).toBe(response[field]);
                }
            });
        });

        it('responds with 400 status if provided email is invalid', async () => {
            let newUser = { email: 'new@new', displayName: 'new_two' };
            let response = await rp.post({ url: requestURL, form: newUser });
            expect(response.statusCode).toBe(400);
        });

        it('responds with status 400 if provided email already in use', async () => {
            let newUser = { email: 'new@new.com', displayName: 'new_two' };
            let response = await rp.post({ url: requestURL, form: newUser });
            expect(JSON.parse(response.body).errors.email).toBe('This email is already in use');
        });

        it('responds with status 400 if provided displayName already in use', async () => {
            let newUser = { email: 'new@new.ru', displayName: 'new' };
            let response = await rp.post({ url: requestURL, form: newUser });
            expect(JSON.parse(response.body).errors.displayName).toBe('This display name is already in use');
        });

        it('does not write to database if provided email/displayName already in use', async () => {
            let newUser = { email: 'new@new.com', displayName: 'new_two' };
            let response = await rp.post({ url: requestURL, form: newUser });
            let user = await User.findOne({ email: 'new@new.com' });
            expect(user.displayName).toNotBe(newUser.displayName);
        });

    });

    describe('PATCH /users/:id', () => {

        it('responds with 404 if user not found by provided ID', async () => {
            let response = await rp.patch(requestURL + nonExistingID);
            expect(response.statusCode).toBe(404);
        });

        it('responds with "user not found" error if user not found by provided ID', async () => {
            let response = await rp.patch(requestURL + nonExistingID);
            expect(JSON.parse(response.body).errors.server).toBe(`User with id ${nonExistingID} not found.`);
        });

        it('responds with status 400 if provided email already in use', async () => {
            let newUser = { email: 'new@new.com', displayName: 'new_two' };
            let response = await rp.patch({ url: requestURL + existingID, form: newUser });
            expect(response.statusCode).toBe(400);
        });

        it('responds with status 400 if provided displayName already in use', async () => {
            let newUser = { email: 'new@new.ru', displayName: 'new' };
            let response = await rp.patch({ url: requestURL + existingID, form: newUser });
            expect(response.statusCode).toBe(400);
        });

        it('responds with a Server Error if provided email/displayName already in use', async () => {
            let newUser = { email: 'new@new.com', displayName: 'new_two' };
            let response = await rp.patch({ url: requestURL + existingID, form: newUser });
            expect(JSON.parse(response.body).errors.server).toBe('Validation failed. Provided [email] and/or [displayName] not valid or already in use.');
        });

        it('does not write to database if provided email/displayName already in use', async () => {
            let newUser = { email: 'new@new.com', displayName: 'new_two' };
            let response = await rp.patch({ url: requestURL + existingID, form: newUser });
            let user = await User.findById(existingID);
            expect(user.displayName).toNotBe(newUser.displayName);
        });

        it('successfully writes valid User to the database', async () => {
            let newUser = { email: 'harmony@harmony.com', displayName: 'harmony' };
            let response = await rp.patch({ url: requestURL + existingID, form: newUser });
            let user = await User.findById(existingID);
            response = JSON.parse(response.body.toString());
            expect(user.displayName).toBe('harmony');
            expect(user.email).toBe('harmony@harmony.com');
        });

    });

    describe('DELETE /users/:id', () => {

        it('responds with 404 if user not found by provided ID', async () => {
            let response = await rp.delete(requestURL + nonExistingID);
            expect(response.statusCode).toBe(404);
        });

        it('responds with "user not found" error if user not found by provided ID', async () => {
            let response = await rp.delete(requestURL + nonExistingID);
            expect(JSON.parse(response.body).errors.server).toBe(`User with id ${nonExistingID} not found.`);
        });

        it('successfully deletes user from the database', async () => {
            let response = await rp.delete(requestURL + existingID);
            let user = await User.findById(existingID);
            // console.log('USER: ', user);
            expect(user).toBe(null);
        });

    });

});