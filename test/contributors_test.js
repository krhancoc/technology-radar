'use strict';

const Path = require('path');
const Code = require('code');
const TestHelpers = require(Path.join(__dirname, '..', 'test_resources', 'helper'));
const _ = require(Path.join(__dirname, '..', 'bin', 'utilities'));
const expect = Code.expect;
const Server = TestHelpers.server;
const driver = TestHelpers.driver;


describe('Contributors', function () {

    before(function (done) {

        TestHelpers.create_users().then(()=> {
            TestHelpers.create_blip_with_user("Test Blip").then((res) => {

                TestHelpers.add_support_with_user("Test Blip").then((res) => {

                    done();
                });
            });
        });
    });

    after(TestHelpers.clean);

    describe('User Creation', function () {

        it('/radar/create/user should be able to create a new user and login', function (done) {

            let options = {
                method: 'POST',
                url: '/radar/create/user',
                payload: {
                    display_name: "TestUser",
                    email: "Test@testerson.com",
                    password: "test",
                    first_name: "TestFirst",
                    last_name: "TestLast"
                }
            };
            Server.inject(options, (res) => {

                expect(res.statusCode).to.equal(200);

                let options = {
                    method: 'POST',
                    url: '/radar/login',
                    payload: {
                        display_name: "TestUser",
                        password: "test"
                    }
                };
                Server.inject(options, (res) => {

                    expect(res.statusCode).to.equal(200);
                    done();
                });

            })
        });

        it('/radar/create/user should not be able to create a new user with identical user name', function (done) {

            let options = {
                method: 'POST',
                url: '/radar/create/user',
                payload: {
                    display_name: "test_user",
                    email: "Test@testerson.com",
                    password: "test",
                    first_name: "TestFirst",
                    last_name: "TestLast"
                }
            };
            Server.inject(options, (res) => {

                expect(res.statusCode).to.equal(400);
                done();
            })
        });
    });


    describe('Routes', function () {

        it('/radar/contributors should be valid route', function (done) {

            let options = {
                method: 'GET',
                url: '/radar/contributors',
            };
            Server.inject(options, (res) => {

                expect(res.statusCode).to.equal(200);
                done();
            });
        });

        it('/radar/contributors/{user} should be valid with correct user', function (done) {

            TestHelpers.get_both('/radar/contributors/test_user', (codes) => {

                expect(codes).to.equal([200, 200]);
                done();
            })
        });

        it('/radar/contributors/{user}/proposed should be valid', function (done) {

            TestHelpers.get_both('/radar/contributors/test_user/proposed', (codes) => {

                expect(codes).to.equal([200, 200]);
                done();
            })
        });

        it('/radar/contributors/{user}/attended should be valid', function (done) {

            TestHelpers.get_both('/radar/contributors/test_user/attended', (codes) => {

                expect(codes).to.equal([200, 200]);
                done();
            })
        });

        it('/radar/contributors/{user}/supported should be valid', function (done) {

            TestHelpers.get_both('/radar/contributors/test_user/supported', (codes) => {

                expect(codes).to.equal([200, 200]);
                done();
            })
        });

        it('/radar/contributors/{user}/proposed should be invalid with unknown user', function (done) {

            TestHelpers.get_both('/radar/contributors/some_silly_unknown_user', (codes) => {

                expect(codes).to.equal([404, 404]);
                done();
            })
        });


        it('/radar/contributors/{user} should be valid with user logged in', function (done) {

            TestHelpers.login_user().then((cookie) => {

                let options = {
                    method: 'GET',
                    url: '/radar/contributors/test_user',
                    headers: {
                        cookie
                    }
                };
                Server.inject(options, (res) => {

                    expect(res.statusCode).to.equal(200);
                    done();
                });
            });
        });

        it('/radar/contributors/{admin} should be valid with user logged in', function (done) {

            TestHelpers.login_admin().then((cookie) => {

                let options = {
                    method: 'GET',
                    url: '/radar/contributors/test_admin',
                    headers: {
                        cookie,
                    }
                };
                Server.inject(options, (res) => {

                    expect(res.statusCode).to.equal(200);
                    done();
                });
            });
        });
    });
});