'use strict';
const Path = require('path');
const CreatePublication = require(Path.join(__dirname, '..', '..', 'bin', 'create', 'create')).createPublication;

/**
 * Root of the Radar frontend
 * @memberOf Routes
 */
const root = {
    method: 'POST',
    path: '/radar/create/publication',
    config: {
        pre: [],
        auth: {
            mode: 'required'
        },
        handler: CreatePublication,
        description: 'Creates a publication with a given date as a key',
        notes: '<b>Must be logged in as an admin to create.</b> ' +
            '<br>Payload must include date key, and other keys are ID\'s of meetings being attached to the publication',
        plugins: {
            'hapi-swagger': {
                payloadType: 'json',
                produces: ['text/html'],
                validate: {
                    payload: {
                        'date': '2099-01',
                        '2000' : 'on',
                        '2001' : 'on',
                    }
                }
            }
        },
        tags: ['api']
    }
};

module.exports = root;
