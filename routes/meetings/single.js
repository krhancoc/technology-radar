'use strict';

const Path = require('path');
const Accept = require('accept');

const PreControllers = require(Path.join(__dirname, '..', '..', 'bin', 'precontrollers'));

/**
 * <h3>Meeting</h3>
 * End-point for collecting a single meeting node and its data.
 *  @memberOf Routes
 */
const meetings = {
    method: 'GET',
    path: '/radar/meetings/{date}',
    config: {
        pre: [{
            method: PreControllers.drive,
            assign: 'neo'
        }],
        handler: (request, reply) => {

            if(request.pre.neo.length == 0) {
                return reply(404).code(404);
            }
            if (Accept.parseAll(request.headers).mediaTypes.includes('text/html')) {
                return reply.view('meetings/info', {
                    title: 'Meeting ' + request.params.date,
                    results: request.pre.neo,
                    auth: request.auth,
                    features: request.pre.features
                });
            }
            else {
                return reply(request.pre.neo).type('application/json');
            }
        },
        description: 'Retrieve a single meeting',
        notes: 'Retrieve a meeting',
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
