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
    path: '/radar/blips/{id}',
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

                if (request.pre.neo.length === 0) {
                    return reply.view('404', {});
                }
                if ('edit' in request.query) {
                    isEditor(request, (editor) => {

                        if (editor) {
                            return reply.view('blips/single', {
                                title: request.pre.neo[0].name,
                                results: request.pre.neo[0],
                                data: request.pre.data,
                                auth: request.auth,
                                edit: true,
                                features: request.pre.features
                            });
                        }
                        return reply.view('blips/single', {
                            title: request.pre.neo[0].name,
                            results: request.pre.neo[0],
                            data: request.pre.data,
                            auth: request.auth,
                            edit: false,
                            error: 'You are not the proposer of this blip',
                            features: request.pre.features
                        });

                    });
                }
                else {
                    return reply.view('blips/single', {
                        title: request.pre.neo[0].name,
                        results: request.pre.neo[0],
                        data: request.pre.data,
                        auth: request.auth,
                        features: request.pre.features
                    });
                }

            }
            else {
                reply(request.pre.neo).type('application/json');
            }
        },
        description: 'Retrieve Blip from the Neo4J database with given ID',
        notes: 'Retrieves information on specific blip',
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
