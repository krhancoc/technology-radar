'use strict';
const Path = require('path');
const CreateMeeting = require(Path.join(__dirname, '..', '..', 'bin', 'create', 'create')).createMeeting;

/**
 * Root of the Radar frontend
 * @memberOf Routes
 */
const root = {
    method: 'POST',
    path: '/radar/create/meeting',
    config: {
        pre: [],
        auth: {
            mode: 'required'
        },
        handler: CreateMeeting,
        description: 'Creates a specific meeting with some date as a key',
        notes: '<b>Must be logged in as an admin to create.</b> ' +
            `<br>Use ID's of the object to attach them to the meeting, if ID is a person, will attach that person as` +
            ` having attended the meeting, if a blip, it will attach that blip as having been proposed at the meeting`,
        plugins: {
            'hapi-swagger': {
                payloadType: 'json',
                produces: ['text/html'],
                validate: {
                    payload: {
                        'date': '2099-01-01',
                        '1934' : 'on',
                        '1935' : 'on',
                        '2001' : 'on',
                    }
                }
            }
        },
        tags: ['api']
    }
};

module.exports = root;
