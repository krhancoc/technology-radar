'use strict';

const Path = require('path');
const Joi = require('joi');
const Accept = require('accept');

const PreControllers = require(Path.join(__dirname, '..', '..', 'bin', 'precontrollers'));
const isEditor = require(Path.join(__dirname, '..', '..', 'bin', 'validate')).isEditor;
const _ = require(Path.join(__dirname, '..', '..', 'bin', 'utilities'));

/**
 * <h3>Blips</h3>
 * End-point for collecting data from the blip nodes
 * <br>
 * Will retrieve a specific node with given name
 * <br>
 * Valid Actions:
 * <ul>
 *  <li>published (Finds where this blip has been published)</li>
 *  <li>proposed (Finds who proposed this blip)</li>
 *  <li>supported (Finds who supported this blip)</li>
 *  </ul>
 *  @memberOf Routes
 */
const blips = {
    method: 'GET',
    path: '/radar/blips/{id}/supported',
    config: {
        pre: [
            [{
                method: PreControllers.get_blip_data,
                assign: 'data'
            },
            {
                method: PreControllers.drive,
                assign: 'neo'
            }],
            {
                method: PreControllers.support_value
            }

        ],
        handler: (request, reply) => {

            if (Accept.parseAll(request.headers).mediaTypes.includes('text/html')) {

                reply.view(`blips/supported`, _.merge(request.pre.features, {
                    title: `Blip - Supported`,
                    results: ['published'].includes(request.params.action) ?
                        _.groupBy(request.pre.neo, 'publisher', []) : request.pre.neo,
                    features: request.pre.features
                }));
            }
            else {
                reply(request.pre.neo).type('application/json');
            }
        },
        description: 'Retrieves the support values of those that added some level of support to this blip',
        notes: 'Returns a list of contributors and their support values - scale from 0 to 5',
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
        validate: {
            params: {
                id: Joi.number()
                    .required()
                    .description('Id of blip')
            }
        },
        tags: ['api']
    }
};

module.exports = blips;
