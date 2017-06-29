'use strict';

const Path = require('path');
const PreControllers = require(Path.join(__dirname, '..', '..', 'bin', 'precontrollers'));

/**
 * <h3>Blips</h3>
 * End-point for collecting data from the blip nodes
 * <br>
 * Will retrieve a specific node with given name
 * <br>
 * Valid Actions:
 * <ul>
 *  <li>published (Finds where this blip has been published)</li>
 *  <li>proposed (Finds who proposed this blip)</li>
 *  <li>supported (Finds who supported this blip)</li>
 *  </ul>
 *  @memberOf Routes
 */
const blips = {
    method: 'POST',
    path: '/radar/blips/{id}/save',
    config: {
        pre: [
            {
                method: PreControllers.save,
                assign: 'success'
            }
        ],
        handler: (request, reply) => {

            if (request.pre.success) {
                reply(200);
            }
            else {
                reply(500);
            }
        }
    }
};

module.exports = blips;
