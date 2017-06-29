'use strict';

const Path = require('path');
const Joi = require('joi');
const Accept = require('accept');
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
    path: '/radar/contributors/{name}',
    config: {
        pre: [
            {
                method: PreControllers.drive,
                assign: 'neo'
            },
            [{
                method: PreControllers.support,
                assign: 'support'
            },
            {
                method: PreControllers.get_contributor,
                assign: 'contributor'
            },
            {
                method: PreControllers.get_unsupported,
                assign: 'unsupported'
            },
            {
                method: PreControllers.get_free_blips,
                assign: 'blips'
            },
            {
                method: PreControllers.get_free_meetings,
                assign: 'meetings'
            },
            {
                method: PreControllers.get_people,
                assign: 'people'
            }]
        ],
        handler: (request, reply) => {

            if(request.pre.neo.length == 0) {
                return reply(404).code(404);
            }
            if (Accept.parseAll(request.headers).mediaTypes.includes('text/html')) {
                reply.view('contributors/info', {
                    title: `${request.params.name}`,
                    results: request.pre.neo,
                    contributor: request.pre.contributor,
                    auth: request.auth,
                    features: request.pre.features,
                    unsupported: request.pre.unsupported,
                    blips: request.pre.blips || [],
                    meetings: request.pre.meetings || [],
                    people: request.pre.people || []
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
        description: 'Retrieve info on a contributor or nodes related to them',
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
                    .description('Name of the Contributor')
            },
            query: {
                search: Joi.string().optional().allow('')
                    .description('Search for blips meeting criteria')
            }
        },
        tags: ['api']
    }
};

module.exports = contributors;
