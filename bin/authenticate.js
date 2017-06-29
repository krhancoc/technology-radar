'use strict';
const Path = require('path');
const Bcrypt = require('bcryptjs');
const Driver = require(Path.join(__dirname,'driver'));
const _ = require(Path.join(__dirname,'utilities'));
const Njwt = require('njwt');

const isUser = (hash) => {

    const driver = new Driver();
    return driver.session.run(`MATCH(n:PERSON) WHERE n.hash = "${hash}" RETURN(n)`).then((results) => {

        const cleaned = _.clean_response(results);
        if(cleaned === null) {
            return false;
        }
        return typeof(cleaned.displayName) !== 'undefined';

    }).catch((err) => {

        console.log(err);
        return err;
    })
};
const userCheck = (user, reply) => {

    if (user) {
        const token = Njwt.create(user, process.env.secretKey);
        return reply(200).code(200).state('Authorization', token.compact(), {
            encoding: 'none'
        });
    }
    return reply(401).code(401);
};


const createHash = (user, pass) => {

    return Bcrypt.hashSync(user + pass, process.env.salt);
};

const authenticate = (request, reply) => {
    if (request.pre.features.login) {
        // Do it the companies way
        return reply(401);
    }
    const hash = Bcrypt.hashSync(request.payload.display_name + request.payload.password, process.env.salt);
    const driver = new Driver();
    driver.session.run(`MATCH(n:PERSON) WHERE n.hash = "${hash}" RETURN(n)`).then((results) => {

        const cleaned = _.clean_response(results);
        return userCheck(cleaned, reply);
    });


};

module.exports.authenticate = authenticate;
module.exports.createHash = createHash;
module.exports.isUser = isUser;
