'use strict';
const Path = require('path');
/**
 * <h3>Docs</h3>
 * Will serve documentation!
 * @memberOf Routes
 */
const docs = {
    method: 'GET',
    path: '/jsdocs/{param*}',
    config: {
        handler: {
            directory: {
                path: Path.join(__dirname,'..','docs')
            }
        }
    }

};

module.exports = docs;
