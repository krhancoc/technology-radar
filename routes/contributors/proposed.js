'use strict';

const Path = require('path');
const Joi = require('joi');
const Accept = require('accept');

const _ = require(Path.join(__dirname, '..', '..', 'bin', 'utilities'));
const PreControllers = require(Path.join(__dirname, '..', '..', 'bin', 'precontrollers'));

/**
 * <h3>Contributors</h3>
 * End-point for collecting data from the person node and its relations
 * <br>
 * Requires the name, and Valid actions are:
 * <br>
 * <ul>
 *  <li>proposed (Finds nodes they proposed)</li>
 *  <li>attended (Finds meetings they attended)</li>
 *  <li>info (Returns the actual node of the person)</li>
 *  <li>supported (Returns the actual node of the person)</li>
 *  </ul>
 *  @memberOf Routes
 */
const contributors = {
    method: 'GET',
    path: '/radar/contributors/{name}/proposed',
    config: {
        pre: [
            [{
                method: PreControllers.drive,
                assign: 'neo'
            },
            {
                method: PreControllers.get_contributor,
                assign: 'contributor'
            }],
            {
                method: PreControllers.support,
                assign: 'support'
            },

        ],
        handler: (request, reply) => {

            if (Accept.parseAll(request.headers).mediaTypes.includes('text/html')) {

                reply.view('contributors/proposed', {
                    title: `${request.params.name} - Proposed`,
                    results: _.groupBy(request.pre.neo, 'name.charAt.toUpperCase', [0, null]),
                    weights: request.pre.support,
                    contributor: request.pre.contributor,
                    auth: request.auth,
                    features: request.pre.features
                });
            }
            else {
                reply(request.pre.neo.map((e) => {

                    if (request.pre.support[e.id]) {
                        e.support_wieght = request.pre.support[e.id];
                    }
                    return e;
                })).type('application/json');
            }
        },
        description: 'Retrieve the blips this contributor proposed',
        notes: 'Retrieves all blips that the contributor has proposed',
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
                    .description('Name of the Contributor')
            },
        },
        tags: ['api']
    }
};

module.exports = contributors;
