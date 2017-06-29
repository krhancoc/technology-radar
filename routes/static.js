'use strict';
const Path = require('path');
/**
 * <h3>Static</h3>
 * Static Files
 * @memberOf Routes
 */
const docs = {
    method: 'GET',
    path: '/radar/static/{param*}',
    config: {
        handler: {
            directory: {
                path: Path.join(__dirname, '..', 'static')
            }
        }
    }
};

module.exports = docs;
