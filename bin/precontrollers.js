'use strict';

const Path = require('path');
const Wreck = require('wreck');
const Boom = require('boom');
const Package = require(Path.join(__dirname,'..','package.json'));
const Driver = require(Path.join(__dirname,'driver'));
const _ = require(Path.join(__dirname,'utilities'));
const ValidActions = require(Path.join(__dirname,'valid_actions'));

let driver = null;

const driverInit = () => {

    if (!driver) {
        driver = new Driver();
    }
};
const getCategory = (path) => {

    return path.split('/')[2];
};

const checkForAction = (path) => {

    let action = path.split('/');
    action = action[action.length - 1];
    if (ValidActions[getCategory(path)][action]) {
        return action;
    }
    return null;
};

const get_publisher = (id, reply) => {

    Wreck.request('GET', `http://localhost:${process.env.NEO_DRIVER_PORT || Package.config.openPort}/radar/blips/${id}/published`, {
        headers: {
            'x-loopback': true,
            'user-agent': 'nodejs/' + Package.version,
            'Accept': 'application/json'
        }
    }, (err, response) => {

        if (err) {
            return reply(Boom.wrap(err));
        }
        Wreck.read(response, null, (err, body) => {

            if (err) {
                reply(Boom.wrap(err));
            }
            else {
                reply(JSON.parse(body));
            }
        });
    });
};

/**
 * Collection of precontrollers used in routes, will pre proccess requests before going to the final route
 *
 * @namespace PreControllers
 */
const PreControllers = {

    /**
     * Retrieve all support values related to a blip.
     * @param {{}} request request passed to controller
     * @param {{}} reply callback/reply of function
     * @memberOf PreControllers
     */
    support_value: (request, reply) => {

        if (request.pre.data === null || request.pre.data.supported === null) {
            reply();
        }
        else {
            Promise.all(request.pre.data.supported.map((e) => {

                return new Promise((resolve, reject) => {

                    driver.session
                        .run(`MATCH (n)-[w:Supports]->(y) WHERE ID(n)=${e.id} AND ID(y)=${request.params.id} RETURN w.weight`)
                        .then((res) => {

                            const cleaned = _.clean_response(res);
                            if (cleaned) {
                                e.support_weight = parseInt(cleaned);
                            }
                            resolve(e);
                        });
                });
            })).then((res) => {

                request.pre.data.supported = res;
                request.logger.info(`Support Info for Blip(${request.params.id})`);
                reply();
            }).catch((err)=>{
                request.logger.error('Problem when attaching support to blip');
            })
        }
    },

    /**
     * Retrieves all data attached to a specific blip and reply with a data object that contains all data related to
     * relationships attached to the blip.
     * @param {{}} request request passed to controller
     * @param {{}} reply callback/reply of function
     * @memberOf PreControllers
     */
    // TODO: Can this be done more effectively now?
    get_blip_data: (request, reply) => {

        if (request.params.action === undefined || request.params.action === null) {
            request.logger.info(`Getting Blip(${request.params.id}) data`);
            driverInit();
            const data = {};
            driver.run('blips', {
                id: request.params.id,
                action: 'supported'
            }).then((results) => {

                data.supported = results;
                driver.run('blips', {
                    id: request.params.id,
                    action: 'contributed'
                }).then((results_1) => {

                    data.contributed = results_1;
                    driver.run('blips', {
                        id: request.params.id,
                        action: 'proposed'
                    }).then((results_2) => {

                        data.proposed = results_2;
                        driver.run('blips', {
                            id: request.params.id,
                            action: 'published'
                        }).then((results_3) => {

                            data.published = results_3;
                            request.logger.info(`Retrieved Blip(${request.params.id}) data`);
                            reply(data);
                        });
                    });
                });
            }).catch((err) => {

                request.logger.err(`Problem getting blip data - ${err}`);
                reply(500).statusCode(500);
            });
        }
        else {
            reply(null);
        }
    },

    /**
     * Will retrieve all publishers attached to blip nodes, requires to be parsed through the drive precontroller first
     * @param {{}} request request passed to controller
     * @param {{}} reply callback/reply of function
     * @memberOf PreControllers
     */
    get_publishers: (request, reply) => {

        const info = {};
        const pubs = request.pre.neo.map((elem) => {

            info[elem.id] = {
                blip: elem
            };
            return elem.id;
        }).map((id) => {

            return new Promise((resolve, reject) => {

                get_publisher(id, (res) => {

                    info[id].pub = res[0];
                    resolve(res);
                });
            });
        });
        Promise.all(pubs).then(() => {

            reply(_.groupBy(Object.keys(info).map((e) => {

                return info[e];
            }), 'pub.date', []));
        }).catch(() => {
            request.logger.info(`Retrieved all publisher info`);
            reply({});
        });
    },

    /**
     * Will retrieve the latest publication
     * @param {{}} request request object
     * @param {{}} reply reply function
     * @memberOf PreControllers
     */
    //TODO : REPLACE COMPANY - tied to problem in createStrings.js
    latest_publication: (request, reply) => {

        driverInit();
        driver.session
            .run(`match(p:PUBLICATION) WHERE p.publisher=\'${process.env.company}\' return p ORDER BY p.date DESC LIMIT 1`, {})
            .then((result) => {

                if (result.records.length === 0) {
                    return reply({
                        publication: '',
                        blips: []
                    });
                }
                result = _.clean_response(result);
                const query = `match(p:PUBLICATION) WHERE ID(p) = toInt(${result.id}) `
                    + 'WITH p MATCH (n)-[:Published_to]->(p) RETURN n';
                driver.session.run(query).then((results) => {

                    request.logger.info(`Retrieved latest publisher info`);
                    return reply({
                        publication: result,
                        blips: _.clean_response(results)
                    });
                });
            });
    },

    /**
     * Goes through the list of blip id's in request, and retrieve the support values for each of the blips in relation
     * to the contributor, relies on the pre-controller drive, assigned under the 'neo' keyword.
     * @param {{}} request request object
     * @param {{}} reply reply object
     */
    support: (request, reply) => {

        if (request.params.action === 'supported') {
            driverInit();

            const blips = {};
            Promise.all(request.pre.neo.map((blip) => {

                const elem = blip.id;
                return new Promise((resolve, reject) => {

                    driver.run('contributors', {
                        name: request.params.name,
                        support_id: elem
                    }).then((results) => {

                        blips[elem] = results[0];
                        resolve(results);
                    });
                });
            })).then((results) => {

                request.logger.info(`Retrieved all support values to a list of blips`);
                reply(blips);
            }).catch((err) => {

                request.logger.error('Error when retrieving support for list of blips');
            })
        }
        else {
            reply({});
        }
    },

    /**
     * Grab the contributor for the specific request
     * @param {{}} request request object
     * @param {{}} reply reply object
     */
    get_contributor: (request, reply) => {

        driverInit();
        driver.run('contributors', {
            name: request.params.name
        }).then((results) => {

            request.logger.info(`Retrieved contributor - ${request.params.name}`);
            reply(results[0]);
        }).catch((err) => {

            request.logger.error(`Problem retrieving contribuor - ${request.params.name}`);
            reply(500)
        })
    },

    /**
     * Main pre-controller passed to every route, will parse paramaters in the request to form a neo4j Cypher request
     * it will then organize the data in a more readable format and send it to the route or other pre controllers
     * @param {{}} request request passed to pre-controller
     * @param {{}} reply callback function
     * @memberOf PreControllers
     */
    drive: (request, reply) => {
        driverInit();
        if (!request.params.action || request.params.action === '{action}') {
            request.params.action = checkForAction(request.url.pathname);
        }
        const params = _.sanitize(_.merge(request.params, request.query));
        driver.run(getCategory(request.url.pathname), params).then((results) => {

            reply(results.map((elem) => {
                delete elem['hash'];
                return elem;
            }));
        }).catch((err) => {

            reply([]);
        });
    },

    /**
     * Used with the save endpoint.  Will save and then pass its success to the handler
     * @param {{}} request request passed to pre-controller
     * @param {{}} reply callback function
     * @memberOf PreControllers
     */
    save: (request, reply) => {

        driverInit();
        //TODO: Make saving more dynamic
        driver.session.run('MATCH(n:BLIP) WHERE ID(n)={id} SET n.description={description}',
            { id: driver.toInt(request.params.id), description: request.payload.body })
            .then((results) => {

                reply(true);
            }).catch((err) => {

                reply(err);
            });
    },
    /**
     * Gathers all the features in the features object, and checks to see which cookes the user
     * currently has activated.  It will the reply with a dictionary object with each key being the name of the
     * feature and the value being whether it is activated or not.  This allows for us to just to see if a feature
     * is activated by calling "features['FEATURE_NAME']'.
     * @param {{}} request request passed to pre-controller
     * @param {{}} reply callback function
     * @memberOf PreControllers
     */
    gather_features: (request, reply) => {

        if (typeof (request.pre.features) !== 'undefined') {
            return;
        }

        const cookies = {};
        if (typeof (request.headers.cookie) !== 'undefined') {
            request.headers.cookie.split(/;\ /).reduce((acc, cookie) => {

                const minus_equals = cookie.substring(0, cookie.length - 1);
                acc[minus_equals] = '';
                return acc;
            }, cookies);
        }

        reply(require('./features').map((x) => {

            if (typeof (request.headers.cookie) !== 'undefined') {
                x.isChecked = typeof (cookies[x.name]) !== 'undefined' ? true : false;
                return x;
            }
            x.isChecked = false;
            return x;

        }).reduce((acc, feature) => {

            acc[feature.name] = feature.isChecked;
            return acc;
        }, {}));
    },


    /**
     * Gets all blips that a user hasn't declared support for where the blip also is not published to
     * a publication.
     * @param {{}} request request passed to pre-controller
     * @param {{}} reply callback function
     * @memberOf PreControllers
     */
    get_unsupported: (request, reply) => {

        if (!request.auth.isAuthenticated) {
            return reply([]);
        }

        driverInit();
        const find = `MATCH (x:PERSON) WHERE x.name = \"${request.auth.credentials.name}\" ` +
            'WITH x MATCH (n:BLIP) WHERE NOT (n)<-[:Supports]-(x)' +
            'WITH x, n MATCH (n) WHERE NOT (x)-[:Proposed]->(n)' +
            'WITH n MATCH (n) WHERE NOT (n)-[:Published_to]->() RETURN (n)';

        driver.session.run(find).then((results) => {

            results = _.clean_response(results);
            if (Object.prototype.toString.call(results) === '[object Object]') {
                return reply([results]);
            }
            return reply(results);
        }).catch((err) => {

            request.logger.error(`Problem getting all unsupported blips - ${err}`);
            return reply(500).statusCode(500);
        });
    },


    /**
     * Gets all blips that a user hasn't declared support for where the blip also is not published to
     * a publication.
     * @param {{}} request request passed to pre-controller
     * @param {{}} reply callback function
     * @memberOf PreControllers
     */
    get_free_blips: (request, reply) => {

        if (request.auth.isAuthenticated) {
            driverInit();
            const find = 'MATCH (n:BLIP) WHERE NOT (n)-[:Proposed_at]->() AND NOT (n)-[:Published_to]->() RETURN (n)';
            driver.session.run(find).then((results) => {

                results = _.clean_response(results);
                if (Object.prototype.toString.call(results) === '[object Object]') {
                    return reply([results]);
                }
                return reply(results);
            }).catch((err) => {

                request.logger.error(`Problem getting all free blips - ${err}`);
                return reply(500).statusCode(500);
            });

        }
        else {
            return reply(null);
        }
    },

    /**
     * Gets all blips that a user hasn't declared support for where the blip also is not published to
     * a publication.
     * @param {{}} request request passed to pre-controller
     * @param {{}} reply callback function
     * @memberOf PreControllers
     */
    get_free_meetings: (request, reply) => {

        const credentials = request.auth.credentials;
        const groups = credentials ?
            (typeof (credentials.group) !== 'undefined' ? credentials.group.toString() : '') : '';
        if (request.auth.isAuthenticated && groups === 'admin') {

            driverInit();
            const find = 'MATCH (n:MEETING) WHERE NOT (n)-[:Contributed_to]->() RETURN (n)';
            driver.session.run(find).then((results) => {

                results = _.clean_response(results);
                request.logger.info('Retrieved unattached meetings');
                if (Object.prototype.toString.call(results) === '[object Object]') {
                    return reply([results]);
                }
                return reply(results);
            }).catch((err) => {

                request.logger.error(`Problem Retrieving unattached meetings - ${err}`);
                reply(500).statusCode(500);
            })
        }
        else {
            return reply(null);
        }
    },

    get_people: (request, reply) => {

        driver.run('contributors', {}).then((results) => {

            request.logger.info(`Retrieved contributors - get_people`);
            return reply(results.map((elem) => {

                delete(elem.hash);
                return elem;
            }));
        }).catch((err) => {

            request.logger.error(`Problem Retrieving contributors in get_people - ${err}`);
        });
    }
};

module.exports = PreControllers;
