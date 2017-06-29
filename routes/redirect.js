'use strict';

const redirect_to_root = {
    method: 'GET',
    path: '/',
    config: {
        handler: (request, reply) => {

            reply.redirect('/radar');
        }
    }
};

module.exports = redirect_to_root;
