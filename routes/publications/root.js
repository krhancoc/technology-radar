'use strict';

const Path = require('path');
const Accept = require('accept');

const _ = require(Path.join(__dirname, '..', '..', 'bin', 'utilities'));
const PreControllers = require(Path.join(__dirname, '..', '..', 'bin', 'precontrollers'));

/**
 *  Publications
 *  End-point will retrieve information in relation to all publication nodes.
 *  @memberOf Routes
 */
const publications = {
    method: 'GET',
    path: '/radar/publications',
    config: {
        pre: [
            {
                method: PreControllers.drive,
                assign: 'neo'
            }
        ],
        handler: (request, reply) => {

            if (Accept.parseAll(request.headers).mediaTypes.includes('text/html')) {
                return reply.view('publications/root', {
                    title: 'Publications',
                    results: _.groupBy(request.pre.neo, 'publisher', []),
                    auth: request.auth,
                    features: request.pre.features
                });
            }

            return reply(request.pre.neo).type('application/json');

        },
        description: 'Will retrieve all publications',
        notes: 'Grabs all data and information related to publications',
        plugins: {
            'hapi-swagger': {
                responses: {
                    'default': {
                        schema: {
                            type: 'string'
                        },
                        description: 'Successful'
                    }
                }
            },
            produces: ['application/json', 'text/html']
        },
        tags: ['api']
    }
};

module.exports = publications;
