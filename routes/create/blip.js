'use strict';
const Path = require('path');
const Joi = require('joi');
const CreateBlip = require(Path.join(__dirname, '..', '..', 'bin', 'create', 'create')).createBlip;

/**
 * Root of the Radar frontend
 * @memberOf Routes
 */
const root = {
    method: ['POST'],
    path: '/radar/create/blip',
    config: {
        pre: [],
        auth: {
            mode: 'required'
        },
        handler: (request, reply) => {

            request.payload.user = request.auth.credentials.name;
            CreateBlip(request.payload).then(() => {

                reply(201);
            },
            (err) => {

                reply(err);
            });
        },
        description: 'Creates a blip',
        notes: 'Proposes a blip by the logged in user',
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                produces: ['text/html'],
                validate: {
                    payload: {
                        name: Joi.string().required().description('Name of the blip'),
                        ring: Joi.string().required().description('Hold, Access, Trial, Adopt'),
                        quadrant: Joi.string().required().description('Tools, Techniques, Languages & Frameworks, Platforms'),
                        description: Joi.string().required().description('Description of the blip, can be html')
                    }
                }
            }
        },
        tags: ['api']
    }

};

module.exports = root;
