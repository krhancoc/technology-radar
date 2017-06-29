/**
 * Root of the Radar frontend
 * @memberOf Routes
 */
'use strict';
const root = {
    method: 'GET',
    path: '/radar/create/user',
    config: {
        pre: [],
        handler: (request, reply) => {

            return reply.view('create/user',
                {
                    title: 'Technology Radar',
                    auth: request.auth,
                    features: request.pre.features
                });

        }
    }

};

module.exports = root;
