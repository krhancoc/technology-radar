'use strict';

const Path = require('path');
const Joi = require('joi');
const Accept = require('accept');

const PreControllers = require(Path.join(__dirname, '..', '..', 'bin', 'precontrollers'));
const _ = require(Path.join(__dirname, '..', '..', 'bin', 'utilities'));
/**
 * <h3>Blips</h3>
 * End-point for collecting all blips
 * <br>
 * Will retrieve all blips, are based on search query will try to find nodes with search string in description or
 * name of the node.
 * <br>
 *  @memberOf Routes
 */
const blips = {
    method: 'GET',
    path: '/radar/blips',
    config: {
        pre: [
            {
                method: PreControllers.drive,
                assign: 'neo'
            }
        ],
        handler: (request, reply) => {

            if (Accept.parseAll(request.headers).mediaTypes.includes('text/html')) {
                reply.view('blips/all', _.merge({
                    title: 'All Blips',
                    results: _.groupBy(request.pre.neo, 'name.charAt.toUpperCase', [0, null]),
                    auth: request.auth,
                    features: request.pre.features
                }));
            }
            else {
                reply(request.pre.neo).type('application/json');
            }
        },
        description: 'Retrieve Blips from the Neo4J Database',
        notes: 'Allows for the filtering and retrieval of blips within the Neo4J Graphing Database',
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
            query: {
                search: Joi.string().optional().allow('')
                    .description('Search for nodes with string in name or description')
            }
        },
        tags: ['api']
    }
};

module.exports = blips;
