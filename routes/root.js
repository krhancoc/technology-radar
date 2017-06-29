'use strict';
const Path = require('path');

const PreControllers = require(Path.join(__dirname, '..', 'bin', 'precontrollers'));
const _ = require(Path.join(__dirname, '..', 'bin', 'utilities'));

/**
 * Root of the Radar frontend
 * @memberOf Routes
 */
const root = {
    method: 'GET',
    path: '/radar',
    config: {
        pre: [
            {
                method: PreControllers.latest_publication,
                assign: 'neo'
            }
        ],
        handler: (request, reply) => {

            return reply.view('index',
                {
                    title: 'Technology Radar',
                    publication: request.pre.neo.publication,
                    results: _.groupBy(request.pre.neo.blips, 'quadrant', []),
                    auth: request.auth,
                    features: request.pre.features
                });
        }
    }

};

module.exports = root;
