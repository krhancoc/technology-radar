'use strict';

/**
 * Root of the Radar frontend
 * @memberOf Routes
 */
const root = {
    method: 'GET',
    path: '/radar/login',
    config: {
        handler: (request, reply) => {

            return reply.view('auth/login', {
                title: 'Technology Radar - Login',
                auth: request.auth,
                popup: request.query.popup,
                features: request.pre.features
            });
        }
    }
};

module.exports = root;
