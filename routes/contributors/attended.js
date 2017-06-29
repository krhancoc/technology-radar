'use strict';

const Path = require('path');
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
    path: '/radar/contributors/{name}/attended',
    config: {
        pre: [
            [{
                method: PreControllers.drive,
                assign: 'neo'
            },
            {
                method: PreControllers.get_contributor,
                assign: 'contributor'
            }]
        ],
        handler: (request, reply) => {

            if (Accept.parseAll(request.headers).mediaTypes.includes('text/html')) {

                reply.view('contributors/attended', {
                    title: `${request.params.name} - attended`,
                    results: request.pre.neo,
                    weights: request.pre.support,
                    contributor: request.pre.contributor,
                    auth: request.auth,
                    features: request.pre.features
                });
            }
            else {
                reply(request.pre.neo).type('application/json');
            }
        },
        description: 'Retrieve the meetings this contributor attended',
        notes: 'Retrieves all meetings that the contributor has attended',
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
        tags: ['api']
    }
};

module.exports = contributors;
