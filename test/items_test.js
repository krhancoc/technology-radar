'use strict';

const Path = require('path');
const Code = require('code');
const TestHelpers = require(Path.join(__dirname, '..', 'test_resources', 'helper'));
const _ = require(Path.join(__dirname, '..', 'bin', 'utilities'));
const expect = Code.expect;
const Server = TestHelpers.server;
const driver = TestHelpers.driver;

describe("Items", function () {

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
                                                    done();
                                                });
                                            });
                                        });
                                    });
                                });
                            })
                        });
                    });
                });
            });
        });

    });

    after(TestHelpers.clean);

    describe('Routes', function () {

        it('/radar/items', function (done) {

            TestHelpers.get_both('/radar/items', (codes) => {

                expect(codes).to.equal([200, 200]);
                done();
            });
        });

        it('/radar/items/testblip1', function (done) {

            TestHelpers.get_both('/radar/items/testblip1', (codes) => {

                expect(codes).to.equal([200, 200]);
                done();
            });
        });
    });
});