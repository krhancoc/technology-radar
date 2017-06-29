'use strict';

const Path = require('path');
const Code = require('code');
const TestHelpers = require(Path.join(__dirname, '..', 'test_resources', 'helper'));
const _ = require(Path.join(__dirname, '..', 'bin', 'utilities'));
const expect = Code.expect;
const Server = TestHelpers.server;
const driver = TestHelpers.driver;

describe("Publications", function () {

    before(function (done) {

        TestHelpers.create_users().then(()=> {

            TestHelpers.create_blip_with_admin("TestBlip1").then(()=> {

                TestHelpers.create_blip_with_admin("TestBlip2").then(()=> {

                    TestHelpers.add_support_with_user("TestBlip1").then(() => {

                        TestHelpers.add_support_with_user("TestBlip2").then(() => {

                            driver.session.run('MATCH (n) WHERE n.name =~"^Test.*" RETURN (n)').then((results) => {

                                results = _.clean_response(results);
                                TestHelpers.login_admin().then((cookie) => {

                                    let options = {
                                        method: 'POST',
                                        url: '/radar/create/meeting',
                                        headers: {
                                            cookie
                                        }
                                    };

                                    let payload = results.reduce((acc, elem) => {
                                        acc[elem.id] = 'on';
                                        return acc;
                                    }, {});

                                    payload.date = "2099-01-01";
                                    options.payload = payload;
                                    Server.inject(options, (res) => {

                                        expect(res.statusCode).to.equal(200);
                                        done();
                                    });
                                });
                            })
                        });
                    });
                })
            })
        });
    });

    after(TestHelpers.clean);

    describe("Creation", function () {
        it('with admin should succeed', function () {

            let options = {
                method: 'GET',
                url: '/radar/meetings',
            };
            Server.inject(options, (res) => {

                TestHelpers.login_admin().then((cookie) => {

                    let payload = {};
                    payload[res.result[0].id] = 'on';
                    payload.date = "2099-01";
                    payload.publication_textarea = "<h1>THIS IS A TEST PUBLICATION</h1>";
                    let options = {
                        method: 'POST',
                        url: '/radar/create/publication',
                        payload,
                        headers: {
                            cookie
                        }
                    };
                    Server.inject(options, (res) => {

                        expect(res.statusCode).to.equal(200);
                    });
                });

            });
        });

        it('with user should fail', function (done) {

            let options = {
                method: 'GET',
                url: '/radar/meetings',
            };
            Server.inject(options, (res) => {


                TestHelpers.login_user().then((cookie) => {

                    let payload = {};
                    payload[res.result[0].id] = 'on';
                    payload.date = "2099-01";
                    payload.publication_textarea = "<h1>THIS IS A TEST PUBLICATION</h1>";
                    let options = {
                        method: 'POST',
                        url: '/radar/create/publication',
                        payload,
                        headers: {
                            cookie
                        }
                    };
                    Server.inject(options, (res) => {
                        expect(res.statusCode).to.equal(401);
                        done();
                    });
                });

            });
        });
    });

    describe('Routes', function () {

        it('/radar/publication should succeed', function (done) {
            let options = {
                method: 'GET',
                url: '/radar/publications',
            };

            Server.inject(options, (res) => {

                expect(res.statusCode).to.equal(200);
                done();
            });
        });

        it(`/radar/publication/${process.env.company}/2099-01 should succeed`, function (done) {

            let options = {
                method: 'GET',
                url: `/radar/publications/${process.env.company}/2099-01`,
            };

            Server.inject(options, (res) => {
                expect(res.statusCode).to.equal(200);
                let options = {
                    method: 'GET',
                    url: `/radar/publications/${process.env.company}/2099-01`,
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

        it(`/radar/publication/${process.env.company}/2099-01/contributed should succeed`, function (done) {

            let options = {
                method: 'GET',
                url: `/radar/publications/${process.env.company}/2099-01/contributed`,
            };

            Server.inject(options, (res) => {

                expect(res.statusCode).to.equal(200);
                let options = {
                    method: 'GET',
                    url: `/radar/publications/${process.env.company}/2099-01/contributed`,
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

        it(`/radar/publication/${process.env.company}/2099-01/published should succeed`, function (done) {

            let options = {
                method: 'GET',
                url: `/radar/publications/${process.env.company}/2099-01/published`,
            };

            Server.inject(options, (res) => {

                expect(res.statusCode).to.equal(200);
                let options = {
                    method: 'GET',
                    url: `/radar/publications/${process.env.company}/2099-01/published`,
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

        it(`/radar/publication/${process.env.company}/2099-02 should fail (no object)`, function (done) {


            let options = {
                method: 'GET',
                url: `/radar/publications/${process.env.company}/2099-02`,
            };

            Server.inject(options, (res) => {

                expect(res.statusCode).to.equal(404);
                done();
            });
        });

    });
});