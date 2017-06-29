'use strict';

const Path = require('path');
const Server = require(Path.join(__dirname, '..', 'app'));
const Driver = require(Path.join(__dirname, '..', 'bin', 'driver'));
const _ = require(Path.join(__dirname, '..', 'bin', 'utilities'));

const admin_credentials = {
    display_name: 'test_admin',
    password: 'secret',
    first_name: 'Test',
    last_name: 'Test',
    email: 'test@test.com'
};

const user_credentials = {
    display_name: 'test_user',
    password: 'secret',
    first_name: 'Test',
    last_name: 'Test',
    email: 'test@test.com'
};

const TestHelpers = {
    driver: new Driver(),
    server: Server,
    get_both: function (url, callback) {

        const codes = [];
        Server.inject({
            method: 'GET',
            url
        }, (js_res) => {

            codes.push(js_res.statusCode);
            Server.inject({
                method: 'GET',
                headers: {
                    accept: 'text/html',
                },
                url
            }, (html_res) => {

                codes.push(html_res.statusCode);
                callback(codes);
            });
        });


    },

    AllSucceed: function (length) {

        return new Array(length).fill([200, 200]);
    },

    login_admin: function () {
        return new Promise((resolve, reject) => {
            Server.inject({
                method: 'POST',
                url: '/radar/login',
                payload: {
                    display_name: admin_credentials.display_name,
                    password: admin_credentials.password
                }
            }, (res) => {

                if (res.statusCode !== 200) {
                    reject('Problem logging in');
                }
                return resolve(res.headers['set-cookie'][0].split(';')[0])
            });
        })
    },

    login_user: function () {
        return new Promise((resolve, reject) => {
            Server.inject({
                method: 'POST',
                url: '/radar/login',
                payload: {
                    display_name: user_credentials.display_name,
                    password: user_credentials.password
                }
            }, (res) => {

                if (res.statusCode !== 200) {
                    reject('Problem logging in');
                }
                return resolve(res.headers['set-cookie'][0].split(';')[0])
            });
        })
    },

    bad_login: function () {
        return new Promise((resolve, reject) => {
            resolve("BADCOOKIE");
        })
    },

    create_blip_with_user: function (name) {

        return TestHelpers.login_user().then((cookie) => {

            return new Promise((resolve, reject) => {

                let options = {
                    method: 'POST',
                    url: '/radar/create/blip',
                    payload: {
                        name: name,
                        ring: 'hold',
                        quadrant: 'tools',
                        description: 'This is a test description'
                    },
                    headers: {
                        cookie
                    }
                };

                Server.inject(options, (res) => {

                    resolve(res);
                });
            });
        });

    },

    create_blip_with_admin: function (name) {

        return TestHelpers.login_admin().then((cookie) => {

            return new Promise((resolve, reject) => {

                let options = {
                    method: 'POST',
                    url: '/radar/create/blip',
                    payload: {
                        name: name,
                        ring: 'hold',
                        quadrant: 'tools',
                        description: 'This is a test description'
                    },
                    headers: {
                        cookie
                    }
                };

                Server.inject(options, (res) => {

                    resolve(res);
                });
            });
        });

    },

    add_support_with_user: function (name) {

        return TestHelpers.driver.session.run(`MATCH (n:BLIP) WHERE n.name ="${name}" RETURN (n)`).then((result) => {

            return new Promise((resolve, reject) => {

                let cleaned = _.clean_response(result);
                TestHelpers.login_user().then((cookie) => {
                    let options = {
                        method: 'POST',
                        url: '/radar/create/support',
                        payload: {},
                        headers: {
                            cookie
                        }
                    };
                    options.payload[cleaned.id] = '4';
                    Server.inject(options, (res) => {

                        resolve(res);
                    });
                });
            });
        })
    },

    clean: function (done) {

        TestHelpers.driver.session.run('MATCH (n) WHERE n.name =~"(?i)^Test.*" DETACH DELETE (n)').then(() => {

            TestHelpers.driver.session.run('MATCH (n) WHERE n.date=~"^2099.*" DETACH DELETE (n)').then(() => {

                done();
            })
        })
    },

    create_users: function () {

        return new Promise((resolve, reject) => {

            let options = {
                method: 'POST',
                url: '/radar/create/user',
                payload: admin_credentials
            };
            Server.inject(options, (res) => {

                TestHelpers.driver.session.run('MATCH (n:PERSON) WHERE n.name = "test_admin" SET n.group = "admin"').then(() => {

                    let options = {
                        method: 'POST',
                        url: '/radar/create/user',
                        payload: user_credentials
                    };

                    Server.inject(options, () => {

                        resolve();
                    })
                })
            })
        });
    }
};

module.exports = TestHelpers;



