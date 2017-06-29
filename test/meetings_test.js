'use strict';

const Path = require('path');
const Code = require('code');
const TestHelpers = require(Path.join(__dirname, '..', 'test_resources', 'helper'));
const _ = require(Path.join(__dirname, '..', 'bin', 'utilities'));
const expect = Code.expect;
const Server = TestHelpers.server;
const driver = TestHelpers.driver;


describe('Meetings', function () {

    before(function (done) {
        TestHelpers.create_users().then(()=> {
            let creation = [
                TestHelpers.create_blip_with_admin("Test-Blip1").then((res) => {

                    expect(res.statusCode).to.equal(200);
                }),
                TestHelpers.create_blip_with_admin("Test-Blip2").then((res) => {

                    expect(res.statusCode).to.equal(200);
                })
            ];
            Promise.all(creation).then(() => {
                creation = [
                    TestHelpers.add_support_with_user("Test-Blip1").then((res) => {

                        expect(res.statusCode).to.equal(200);
                    }),
                    TestHelpers.add_support_with_user("Test-Blip2").then((res) => {

                        expect(res.statusCode).to.equal(200);
                    }),
                ]
            }).then(()=> {
                done();
            })
        });
    });

    after(function (done) {

        driver.session.run('MATCH (n) WHERE n.name =~"^Test.*" DETACH DELETE(n)').then(()=> {

            driver.session.run('MATCH (n:MEETING) WHERE n.date = "2099-01-01" DETACH DELETE (n)').then(()=> {

                done();
            });
        })

    });

    it('should be able to be created by an admin', function (done) {
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

    it('should not be able to be created with a user', function () {
        driver.session.run('MATCH (n) WHERE n.name =~"^Test.*" RETURN (n)').then((results) => {

            results = _.clean_response(results);
            TestHelpers.login_user().then((cookie) => {

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

                    expect(res.statusCode).to.equal(401);
                });
            });
        })
    });

    it('/radar/meetings should be reachable', function () {

        TestHelpers.get_both('/radar/meetings', (codes) => {

            expect([codes]).to.equal(TestHelpers.AllSucceed(1));
        });
    });

    it('/radar/meetings/{date} should be reachable with valid id', function (done) {

        TestHelpers.get_both(`/radar/meetings/2099-01-01`, (codes) => {

            expect([codes]).to.equal(TestHelpers.AllSucceed(1));
            done();
        });
    });

    it('/radar/meetings/{date}/proposed should be reachable with valid id', function (done) {

        TestHelpers.get_both(`/radar/meetings/2099-01-01/proposed`, (codes) => {

            expect([codes]).to.equal(TestHelpers.AllSucceed(1));
            done();
        });
    });


    it('/radar/meetings/{date}/attended should be reachable with valid id', function (done) {

        TestHelpers.get_both(`/radar/meetings/2099-01-01/attended`, (codes) => {

            expect([codes]).to.equal(TestHelpers.AllSucceed(1));
            done();
        });
    });

    it('/radar/meetings/{date}/contributed should be reachable with valid id', function (done) {

        TestHelpers.get_both(`/radar/meetings/2099-01-01/contributed`, (codes) => {

            expect([codes]).to.equal(TestHelpers.AllSucceed(1));
            done();
        });
    });
    it('/radar/meetings/{id} should fail with invalid id', function (done) {

        TestHelpers.get_both(`/radar/meetings/STUPIDID120398123`, (codes) => {

            expect(codes).to.equal([404, 404]);
            done();
        });
    });


});