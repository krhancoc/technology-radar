'use strict';

const Path = require('path');
const Joi = require('joi');
const Authenticate = require(Path.join(__dirname,'..','..','bin','authenticate')).authenticate;

/**
 * Root of the Radar frontend
 * @memberOf Routes
 */
const root = {
    method: 'POST',
    path: '/radar/login',
    config: {
        handler: Authenticate,
        description: 'Login the user',
        notes: 'Log the user into the system using JSON Web Tokens',
        plugins: {
            'hapi-swagger': {
                payloadType: 'form'
                ,
                produces: ['text/html'],
                validate: {
                    payload: {
                        display_name: Joi.string().required(),
                        password: Joi.string().required()
                    }
                }
            }
        },
        tags: ['api']
    }
};

module.exports = root;
