'use strict';

const Path = require('path');

/**
 * Root of the Radar frontend
 * @memberOf Routes
 */
const radar = {
    method: 'GET',
    path: '/radar/visualization/{param*}',
    config: {
        handler: {
            directory: {
                path: Path.join(__dirname, '..', 'radar')
            }
        }
    }

};

module.exports = radar;
