'use strict';

const Path = require('path');
const Joi = require('joi');
const Accept = require('accept');
const PreControllers = require(Path.join(__dirname, '..', '..', 'bin', 'precontrollers'));
/**
 * <h3>Meeting</h3>
 * End-point for collecting data from the meeting node and its relations
 * <br>
 * Requires the date of the meeting, and Valid actions are:
 * <br>
 * <ul>
 *  <li>proposed (Finds nodes proposed at this meeting)</li>
 *  <li>attended (Finds who attended this meeting)</li>
 *  <li>info (Default - finds information on this meeting)</li>
 *  <li>contributed (Finds all publications that this meeting contributed to)</li>
 *  <ul>
 *  @memberOf Routes
 */
const meetings = {
    method: 'GET',
    path: '/radar/meetings/{date}/contributed',
    config: {
        pre: [
            {
                method: PreControllers.drive,
                assign: 'neo'
            }
        ],
        handler: (request, reply) => {

            if (Accept.parseAll(request.headers).mediaTypes.includes('text/html')) {
                reply.view('meetings/contributed', {
                    title: `Meeting - ${request.params.date} - Contributed`,
                    results: request.pre.neo,
                    auth: request.auth,
                    features: request.pre.features
                });
            }
            else {
                reply(request.pre.neo).type('application/json');
            }
        },
        description: 'Retrieve which publication(s) this meeting contributed to',
        notes: 'Return publications themselves',
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
                date: Joi.string()
                    .description('Date of Meeting: Format - yyyy-mm-dd')
            }
        },
        tags: ['api']
    }
};

module.exports = meetings;
