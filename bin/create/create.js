'use strict';
const Path = require('path');
const Driver = require(Path.join(__dirname,'..','driver'));
const CreateStrings = require(Path.join(__dirname,'createStrings'));
const _ = require(Path.join(__dirname,'..','utilities'));


/**
 * Creates a promise to create a blip within the Neo4J database the given payload object - blip.
 * @param {{}} blip The object that holds the params for the driver. Requires: user (user name), name (blip name), quadrant,
 * ring, description
 * @returns {Promise} Promise object that creates the blip object.
 */
const createBlip = (blip) => {

    return new Promise((resolve, reject) => {

        // Create slug for name
        blip.slug = _.sluggify(blip.name);
        const driver = new Driver();
        driver.session.run(CreateStrings.blip(), blip)
            .then((result) => {

                resolve();
            }).catch((err) => {

            reject(err);
        });
    });
};

/**
 * Creates a meeting with the given request.
 * @param request
 * @param reply
 */
const createMeeting = (request, reply) => {

    if (request.auth.credentials.group !== 'admin') {
        return reply(401).code(401);
    } else {
        const driver = new Driver();
        const meeting_create_query = CreateStrings.meeting(request.payload.date);
        driver.session.run(meeting_create_query).then((result) => {

            const meeting = _.clean_response(result);
            delete (request.payload.date);
            const blips = Object.keys(request.payload).map((elem) => {

                return new Promise((resolve, reject) => {


                    driver.run('blips', {id: elem}).then((result) => {
                        const query = result.length == 0 ?
                                CreateStrings.attended(meeting.id, elem) : CreateStrings.proposed_at(meeting.id, elem);

                        driver.session.run(query).then(() => {

                            resolve();
                        });
                    });
                });
            });
            Promise.all(blips).then(() => {

                reply(200).code(200);
            }).catch(() => {

                reply(500).code(500);
            });
        });
    }
};

/**
 * Create a publication with a given request.
 * @param request
 * @param reply
 */
const createPublication = (request, reply) => {

    if (request.auth.credentials.group !== 'admin') {
        return reply(401).code(401);
    }

    const driver = new Driver();
    const publication_create_query = CreateStrings.publication(request.payload.date, request.payload.publication_textarea);
    driver.session.run(publication_create_query).then((result) => {

        const publication = _.clean_response(result);
        delete (request.payload.date);
        delete (request.payload.publication_textarea);
        const blips = Object.keys(request.payload).map((elem) => {

            return new Promise((resolve, reject) => {

                let query = CreateStrings.contributed_to(publication.id, elem);
                driver.session.run(query).then(() => {

                    query = CreateStrings.published_to(publication.id, elem);
                    driver.session.run(query).then(() => {

                        resolve();
                    });
                });
            });
        });
        Promise.all(blips).then(() => {

            reply(200);
        }).catch(() => {

            reply(500);
        });
    });
};

/**
 * Attach's support from a contributor to blips
 * @param request
 * @param reply
 */
const attachSupport = (request, reply) => {

    const driver = new Driver();
    const blips = Object.keys(request.payload).map((elem) => {

        return new Promise((resolve, reject) => {

            const query = CreateStrings.support(request.auth.credentials.name, elem, request.payload[elem]);
            driver.session.run(query).then(() => {

                resolve();
            }).catch((err) => {

                console.log(err);
                reject();
            });
        });
    });
    Promise.all(blips).then(() => {

        reply(200);
    }).catch(() => {

        reply(500);
    });
};

/**
 * Creates a contributor
 * @param user
 * @returns {Promise}
 */
const createUser = (user) => {

    return new Promise((resolve, reject) => {

        const driver = new Driver();
        driver.run('contributors', {
            name: user.name
        }).then((response) => {

            if (response.length === 0) {
                driver.session.run(CreateStrings.user(), user)
                    .then((result) => {

                        resolve();
                    });
            }
            else {
                reject('User name taken');
            }
        });
    });
};

module.exports.createPublication = createPublication;
module.exports.createBlip = createBlip;
module.exports.createMeeting = createMeeting;
module.exports.attachSupport = attachSupport;
module.exports.createUser = createUser;
