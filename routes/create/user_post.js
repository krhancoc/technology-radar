'use strict';
const Path = require('path');
const Joi = require('joi');
const CreateHash = require(Path.join(__dirname, '..', '..', 'bin', 'authenticate')).createHash;
const CreateUser = require(Path.join(__dirname, '..', '..', 'bin', 'create', 'create')).createUser;
const Authenticate = require(Path.join(__dirname, '..', '..', 'bin', 'authenticate')).authenticate;
/**
 * Root of the Radar frontend
 * @memberOf Routes
 */
const root = {
    method: 'POST',
    path: '/radar/create/user',
    config: {
        pre: [],
        handler: (request, reply) => {

            const user_obj = {
                name: request.payload.display_name,
                displayName: `${request.payload.first_name} ${request.payload.last_name}`,
                hash: CreateHash(request.payload.display_name, request.payload.password)
            };

            CreateUser(user_obj)
                .then(() => {

                    return Authenticate(request, reply);
                }, () => {

                    reply("User Name Taken").code(400);
                });

        },
        description: 'Creates a User',
        notes: 'Creates a user for the system',
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                produces: ['text/html'],
                validate: {
                    payload: {
                        display_name: Joi.string().required()
                            .description('Display name of the user: usually first letter of firstname concat with lastname'),
                        password: Joi.string().required()
                            .description('Password for the user'),
                        email: Joi.string().email()
                            .description('Email of the user'),
                        firstname: Joi.string().required()
                            .description('First name of the user'),
                        lastname: Joi.string().required()
                            .description('Last name of the user')
                    }
                }
            }
        },
        tags: ['api']
    }

};

module.exports = root;
