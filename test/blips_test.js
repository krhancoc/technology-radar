'use strict';
const Path = require('path');
const Code = require('code');
const TestHelpers = require(Path.join(__dirname, '..', 'test_resources', 'helper'));
const _ = require(Path.join(__dirname, '..', 'bin', 'utilities'));
const expect = Code.expect;
const Server = TestHelpers.server;
const driver = TestHelpers.driver;

describe('Blips', function () {

    after(TestHelpers.clean);

    before(function (done) {

        TestHelpers.create_users().then(() => {
            TestHelpers.create_blip_with_admin("Test Blip").then((res) => {

                expect(res.statusCode).to.equal(200);
                done();
            });
        });

    });

    describe('Blip Creation', function () {
        it('should be able to be created with any user', function () {

            TestHelpers.create_blip_with_admin("Test Another Blip").then((res) => {

                expect(res.statusCode).to.equal(200);
                TestHelpers.create_blip_with_user("Test Another Blip 2").then((res) => {

                    expect(res.statusCode).to.equal(200);
                })
            })
        });

        it('cannot be created when not logged in', function () {
            TestHelpers.bad_login().then((cookie) => {
                let options = {
                    method: 'POST',
                    url: '/radar/create/blip',
                    payload: {
                        name: 'Bad Blip',
                        ring: 'hold',
                        quadrant: 'tools',
                        description: 'This is a test description'
                    },
                    headers: {
                        cookie
                    }
                };
                Server.inject(options, (res) => {
                    expect(res.statusCode).to.equal(400);
                });
            });
        });
    });

    describe('Routes', function () {
        it('/radar/blips should succeed', function (done) {
            TestHelpers.get_both('/radar/blips', function (codes) {
                expect(codes).to.equal([200, 200]);
                done();
            });
        });

        it('/radar/blips/{id} should pass with valid id', function (done) {

            driver.session.run('MATCH (n:BLIP) WHERE n.name = "Test Blip" RETURN (n)').then((results) => {

                results = _.clean_response(results);
                TestHelpers.get_both(`/radar/blips/${results.id}`, (codes) => {

                    expect(codes).to.equal([200, 200]);
                    done();
                });
            });

        });


        it('/radar/blips/{id}?edit=true should pass with valid id and login', function (done) {

            driver.session.run('MATCH (n:BLIP) WHERE n.name = "Test Blip" RETURN (n)').then((results) => {

                results = _.clean_response(results);

                TestHelpers.login_admin().then((cookie) => {


                    let options = {
                        method: 'GET',
                        url: `/radar/blips/${results.id}?edit=true`,
                        headers: {
                            accept: 'text/html',
                            cookie,
                        }
                    };
                    Server.inject(options, (res) => {
                        expect(res.statusCode).to.equal(200);
                        done();
                    })
                });

            });

        });

        it('/radar/blips/{id}/proposed should pass with valid id', function (done) {

            driver.session.run('MATCH (n:BLIP) WHERE n.name = "Test Blip" RETURN (n)').then((results) => {

                results = _.clean_response(results);
                TestHelpers.get_both(`/radar/blips/${results.id}/proposed`, (codes) => {

                    expect(codes).to.equal([200, 200]);
                    done();
                });
            });

        });

        it('/radar/blips/{id}/supported should pass with valid id', function (done) {

            driver.session.run('MATCH (n:BLIP) WHERE n.name = "Test Blip" RETURN (n)').then((results) => {

                results = _.clean_response(results);
                TestHelpers.get_both(`/radar/blips/${results.id}/supported`, (codes) => {

                    expect(codes).to.equal([200, 200]);
                    done();
                });
            });

        });

        it('/radar/blips/{id}/contributed should pass with valid id', function (done) {

            driver.session.run('MATCH (n:BLIP) WHERE n.name = "Test Blip" RETURN (n)').then((results) => {

                results = _.clean_response(results);
                TestHelpers.get_both(`/radar/blips/${results.id}/contributed`, (codes) => {

                    expect(codes).to.equal([200, 200]);
                    done();
                });
            });

        });

        it('/radar/blips/{id}/published should pass with valid id', function (done) {

            driver.session.run('MATCH (n:BLIP) WHERE n.name = "Test Blip" RETURN (n)').then((results) => {

                results = _.clean_response(results);
                TestHelpers.get_both(`/radar/blips/${results.id}/published`, (codes) => {

                    expect(codes).to.equal([200, 200]);
                    done();
                });
            });

        });

        it('/radar/blips/{id} should fail with invalid id', function (done) {

            TestHelpers.get_both(`/radar/meetings/STUPIDID120398123`, (codes) => {

                expect(codes).to.equal([404, 404]);
                done();
            });
        });
    });
});