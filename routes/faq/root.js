'use strict';
/**
 * <h3>FAQ</h3>
 * Static text/html content regarding faq
 *  @memberOf Routes
 */
const faq = {
    method: 'GET',
    path: '/radar/faq',
    config: {
        handler: (request, reply) => {

            reply.view('faq/index', {
                title: 'Technology Radar - FAQ',
                auth: request.auth,
                features: request.pre.features
            });
        },
        description: 'Route to static response for FAQ',
        notes: 'none',
        tags: ['api-no']
    }
};

module.exports = faq;
