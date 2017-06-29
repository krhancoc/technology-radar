'use strict';

const Path = require('path');
const Joi = require('joi');
const Accept = require('accept');

const _ = require(Path.join(__dirname, '..', '..', 'bin', 'utilities'));
const PreControllers = require(Path.join(__dirname, '..', '..', 'bin', 'precontrollers'));

/**
 *  <h3>Publications</h3>
 *  End-point will retrieve information in relation to all publication nodes.  Requires a publisher (Example: Thoughtworks)
 *  and a date (Example: 2017-03).  Available actions are:
 *  <br>
 *  <ul>
 *      <li>info (Finds information on specific publication)</li>
 *      <li>published (Finds all blips published to this publication)</li>
 *      <li>contributed (Finds all the meetings that contributed to this publication)</li>
 *  </ul>
 *  @memberOf Routes
 */
const publications = {
    method: 'GET',
    path: '/radar/publications/{publisher}/{date}/published',
    config: {
        pre: [
            {
                method: PreControllers.drive,
                assign: 'neo'
            }
        ],
        handler: (request, reply) => {

            if (Accept.parseAll(request.headers).mediaTypes.includes('text/html')) {
                reply.view('publications/published', {
                    title: `${request.params.publisher} ${request.params.date} - ${request.params.action}`,
                    results: _.groupBy(request.pre.neo, 'name.charAt.toUpperCase', [0, null]),
                    auth: request.auth,
                    features: request.pre.features
                });
            }
            else {
                reply(request.pre.neo).type('application/json');
            }
        },
        description: 'Retrieve all blips that were published to this publication',
        notes: 'Grabs all blips attached to this publication',
        plugins: {
            'hapi-swagger': {
                responses: {
                    'default': {
                        schema: {
                            type: 'json'
                        },
                        description: 'Successful'
                    }
                }
            }
        },
        validate: {
            params: {
                publisher: Joi.string()
                    .description('Name of the publisher. Example: Thoughtworks'),
                date: Joi.string()
                    .description('Date of the publication.  Example: 2017-03'),
            }
        },
        tags: ['api']
    }
};

module.exports = publications;
