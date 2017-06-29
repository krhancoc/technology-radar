'use strict';
const Path = require('path');
const AttachSupport = require(Path.join(__dirname, '..', '..', 'bin', 'create', 'create')).attachSupport;

/**
 * Root of the Radar frontend
 * @memberOf Routes
 */
const root = {
    method: 'POST',
    path: '/radar/create/support',
    config: {
        pre: [],
        auth: {
            mode: 'required'
        },
        handler: AttachSupport,
        description: 'Attaches a blip with a support relationship from logged in user',
        notes: '<b>Must be logged in prior to attaching support.</b> ' +
        '<br>Attaches 4 support to blip with id 1934, blip must exist',
        plugins: {
            'hapi-swagger': {
                payloadType: 'json',
                produces: ['text/html'],
                validate: {
                    payload: {
                        '1934' : 4,
                    }
                }
            }
        },
        tags: ['api']
    }

};

module.exports = root;
