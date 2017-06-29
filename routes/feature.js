'use strict';
const Path = require('path');
const Features = require(Path.join(__dirname, '..', 'bin', 'features'));

/**
 * Somewhat hidden feature toggle page!
 * @memberOf Routes
 */
const root = {
    method: ['POST', 'GET'],
    path: '/radar/features',
    config: {
        pre: [],
        handler: (request, reply) => {

            if (request.method.toLowerCase() === 'get') {
                return reply.view('features', {
                    title: 'Technology Radar - Features',
                    features: request.pre.features,
                    auth: request.auth
                });
            }

            Features.map((item) => {

                reply.unstate(item.name);
            });

            const keys = Object.keys(request.payload);
            for (const index in keys) {
                reply.state(keys[index]);
            }
            reply.redirect('/');

        }
    }

};

module.exports = root;
