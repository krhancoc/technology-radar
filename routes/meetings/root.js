'use strict';

const Path = require('path');
const Accept = require('accept');

const PreControllers = require(Path.join(__dirname, '..', '..', 'bin', 'precontrollers'));

/**
 * <h3>Meeting</h3>
 * End-point for collecting all meeting nodes and their data.
 *  @memberOf Routes
 */
const meetings = {
    method: 'GET',
    path: '/radar/meetings',
    config: {
        pre: [{
            method: PreControllers.drive,
            assign: 'neo'
        }],
        handler: (request, reply) => {

            if (Accept.parseAll(request.headers).mediaTypes.includes('text/html')) {
                reply.view('meetings/all', {
                    title: 'Meetings - all',
                    results: request.pre.neo,
                    auth: request.auth,
                    features: request.pre.features
                });
            }
            else {
                reply(request.pre.neo).type('application/json');
            }
        },
        description: 'Retrieve all meetings',
        notes: 'Retrieve the list of all meetings held',
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

module.exports = meetings;
