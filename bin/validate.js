'use strict';
const Path = require('path');
const GetData = require(Path.join(__dirname,'precontrollers')).get_blip_data;
const isUser = require(Path.join(__dirname,'authenticate')).isUser;

const validate = (decoded, request, callback) => {

    isUser(decoded.hash).then((result) => {
        return callback(null, result);
    });

};

const isEditor = (request, callback) => {

    GetData(request, (data) => {

        if (data.proposed.length > 0 && request.auth.credentials && request.auth.isAuthenticated) {
            callback(parseInt(request.auth.credentials.id) === parseInt(data.proposed[0].id));
        }
        else {
            callback(false);
        }
    });
};

module.exports.validate = validate;
module.exports.isEditor = isEditor;
