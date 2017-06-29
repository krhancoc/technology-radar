'use strict';

const Path = require('path');
const Code = require('code');
const TestHelpers = require(Path.join(__dirname, '..', 'test_resources', 'helper'));
const _ = require(Path.join(__dirname, '..', 'bin', 'utilities'));
const expect = Code.expect;
const Server = TestHelpers.server;
const driver = TestHelpers.driver;


describe('General', function () {

    before(function (done) {
        done();
    });

    after(TestHelpers.clean);

    it('/radar is valid route', function (done) {

        TestHelpers.get_both('/radar', (codes) => {

            expect(codes).to.equal([200, 200]);
            done();
        })
    });

    describe('login', function () {
        it('will fail on bad user and password ', function (done) {

            let options = {
                method: 'POST',
                url: '/radar/login',
                payload: {
                    display_name: "BadUser",
                    password: "BadPass",
                }
            };

            Server.inject(options, (res) => {

                expect(res.statusCode).to.equal(401);
                done()
            });
        });

        it('will fail on bad password ', function (done) {

            let options = {
                method: 'POST',
                url: '/radar/login',
                payload: {
                    display_name: "test_user",
                    password: "BadPass",
                }
            };

            Server.inject(options, (res) => {

                expect(res.statusCode).to.equal(401);
                done()
            });
        });

        it('will fail on bad user ', function (done) {

            let options = {
                method: 'POST',
                url: '/radar/login',
                payload: {
                    display_name: "badUser",
                    password: "test",
                }
            };

            Server.inject(options, (res) => {

                expect(res.statusCode).to.equal(401);
                done()
            });
        });
    });

    describe("Routes", function () {

        it('/radar/features Routes should succeed', function (done) {

            let options = {
                method: 'GET',
                url: '/radar/features',
                headers: {
                    accept: 'text/html'
                }
            };
            Server.inject(options, (res) => {

                expect(res.statusCode).to.equal(200);
                done();
            });
        });

        it('/radar/faq succeed', function (done) {

            let options = {
                method: 'GET',
                url: '/radar/faq',
                headers: {
                    accept: 'text/html'
                }
            };
            Server.inject(options, (res) => {

                expect(res.statusCode).to.equal(200);
                done();
            });
        });


        it('/radar/login succeed', function (done) {

            let options = {
                method: 'GET',
                url: '/radar/login',
                headers: {
                    accept: 'text/html'
                }
            };
            Server.inject(options, (res) => {

                expect(res.statusCode).to.equal(200);
                done();
            });
        });

        it('/radar/logout succeed', function (done) {

            let options = {
                method: 'GET',
                url: '/radar/logout',
                headers: {
                    accept: 'text/html'
                }
            };
            Server.inject(options, (res) => {

                expect(res.statusCode).to.equal(200);
                done();
            });
        });
    });
});