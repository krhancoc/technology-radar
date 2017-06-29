'use strict';

const Path = require('path');
const Accept = require('accept');
const Joi = require('joi');
const PreControllers = require(Path.join(__dirname, '..', '..', 'bin', 'precontrollers'));

/**
 * <h3>Contributors</h3>
 * End-point for collecting data from the person node and its relations
 *  @memberOf Routes
 */
const contributors = {
    method: 'GET',
    path: '/radar/contributors',
    config: {
        pre: [{
            method: PreControllers.drive,
            assign: 'neo'
        }],
        handler: (request, reply) => {

            if (Accept.parseAll(request.headers).mediaTypes.includes('text/html')) {
                reply.view('contributors/all', {
                    title: 'Contributors',
                    results: request.pre.neo,
                    auth: request.auth,
                    features: request.pre.features
                });
            }
            else {
                reply(request.pre.neo.map((elem) => {
                    delete elem['hash'];
                    return elem;
                })).type('application/json');
            }
        },
        description: 'Retrieve all contributors',
        notes: 'Will retrieve info on what blips the individual has proposed, meetings attended etc.',
        plugins: {
            'hapi-swagger': {
                responses: {
                    'default': {
                        schema: {
                            type: 'json'
                        },
                        description: 'Successful'
                    }
                },
                produces: ['application/json', 'text/html']
            }
        },
        validate: {
            params: {
                name: Joi.string()
                    .description('Name of the Contributor'),
            },
        },
        tags: ['api']
    }
};

module.exports = contributors;
