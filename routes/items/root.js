'use strict';

const Path = require('path');
const Accept = require('accept');
const Joi = require('joi');

const PreControllers = require(Path.join(__dirname, '..', '..', 'bin', 'precontrollers'));
const _ = require(Path.join(__dirname, '..', '..', 'bin', 'utilities'));

/**
 * <h3>Items</h3>
 * End-point for collecting data from the items.  Items are defined as a blips unique by name, will aggregate all data of a blip
 * under one name.
 * <br>
 *  @memberOf Routes
 */
const blips = {
    method: 'GET',
    path: '/radar/items',
    config: {
        pre: [{
            method: PreControllers.drive,
            assign: 'neo'
        }],
        handler: (request, reply) => {

            if (Accept.parseAll(request.headers).mediaTypes.includes('text/html')) {
                reply.view('items/all', {
                    title: 'All Items',
                    results: _.groupBy(request.pre.neo, 'name', []),
                    auth: request.auth,
                    features: request.pre.features
                });
            }
            else {
                reply(_.groupBy(request.pre.neo, 'name', [])).type('application/json');
            }
        },
        description: 'Retrieve all items with unique names',
        notes: 'Retrieves all blips under a unique name, an item consists of multiples blips with the same name',
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
            query: {
                search: Joi.string().optional().allow('')
                    .description('Search in items with given name or string in name')
            }
        },
        tags: ['api']
    }
};

module.exports = blips;
