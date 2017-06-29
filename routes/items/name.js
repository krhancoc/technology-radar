'use strict';

const Path = require('path');
const Joi = require('joi');
const Accept = require('accept');

const PreControllers = require(Path.join(__dirname, '..', '..', 'bin', 'precontrollers'));

/**
 * <h3>Items</h3>
 * End-point for collecting data from the item node with given name
 * <br>
 * Will retrieve a specific node with given name
 *  @memberOf Routes
 */
// TODO: How to handle when multiple blips for multiple Publishers, sorting by publisher seems to make the most sense
const items = {
    method: 'GET',
    path: '/radar/items/{name}',
    config: {
        pre: [{
            method: PreControllers.drive,
            assign: 'neo'
        },
            {
                method: PreControllers.get_publishers,
                assign: 'pub'
            }
        ],
        handler: (request, reply) => {
            if (Accept.parseAll(request.headers).mediaTypes.includes('text/html')) {
                reply.view('items/single', {
                    title: request.pre.pub.length ? request.pre.pub[Object.keys(request.pre.pub)[0]][0].blip.name : "Blip",
                    results: Object.keys(request.pre.pub).length > 0 ? request.pre.pub : {},
                    auth: request.auth,
                    features: request.pre.features
                });
            }
            else {
                reply(request.pre.pub).type('application/json');
            }
        },
        description: 'Retrieve info on specific Item with given name',
        notes: 'Allows for the full retrieval of an item and the publications attached to it.  This tries to ' +
        'replicate the thoughtworks way of organizing items',
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
                name: Joi.string()
                    .required()
                    .description('Name of Item')
            }
        },
        tags: ['api']
    }
};

module.exports = items;
