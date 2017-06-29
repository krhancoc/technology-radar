'use strict';

/**
 * Logout Route, just unstates the cookie placed
 * @memberOf Routes
 */
const root = {
    method: ['GET'],
    path: '/radar/logout',
    config: {
        handler: (request, reply) => {

            reply.unstate('Authorization');
            reply().code(200);
        },
        description: 'Logs user out',
        notes: 'This will just remove the Authorization cookie from the user',
        plugins: {
            'hapi-swagger': {
                produces: ['text/html']
            }
        },
        tags: ['api']
    }

};

module.exports = root;
