'use strict';
const Path = require('path');
const neo4j = require('neo4j-driver').v1;
const URLPackage = require('url');

const CreateQueryString = require(Path.join(__dirname, '..', 'bin', 'querystring'));
const _ = require(Path.join(__dirname, '..', 'bin', 'utilities'));

const [url, user, password] = ((info) => {

    const obj = URLPackage.parse(info);
    return [
        `${obj.host}`,
        `${obj.auth.split(':')[0]}`,
        `${obj.auth.split(':')[1]}`
    ];
})(process.env.NEO4J_INFO);

const neoDriver = neo4j.driver(`bolt://${url}`, neo4j.auth.basic(user, password));
const session = neoDriver.session();

/**
 * The Driver is the object that will interact with a database, specified by its options, please make sure
 * port specified is the bolt port.
 * @example <caption>Example usage with proper Options</caption>
 * new Driver({
 *  url: 'localhost:7687',
 *  user: 'neo4j',
 *  password: 'neo4j'
 * });
 * @param {{}} opts JSON config for the Driver, this needs to contains the url with port, username,
 * and password
 * @constructor
 */
const Driver = function () {

    this.neoDriver = neoDriver; // by reference to constant
    this.session = session;

};

/**
 * Will run a Cypher Query to the connected database
 * @example <caption>Example Run Command</caption>
 *
 * let driver = new Driver({
 *  url: 'localhost:7687',
 *  user: 'neo4j',
 *  password: 'neo4j'
 * });
 *
 * driver.run('blips', {
 *  publisher: 'Company',
 *  publicationDate: '2017-03'
 * }).then(console.log);
 *
 * @param {String} command String command that relates to the Valid Actions found in valid_actions.js, this
 * tells the run command which type of node it should intially be looking at.
 * @param {{}} parameters Contains the parameters for the given command.
 * @returns {Promise.<TResult>|*|Promise} The promise that will return the results of the Cypher query to the data
 * base.
 */
Driver.prototype.run = function (command, parameters) {

    const str = CreateQueryString(command, parameters);
    return this.session
        .run(str)
        .then((results) => {

            return _.clean_response(results);
        }).catch((err) => {

            throw new Error(`Problem running query to server. - ${err}`);
        })
};


Driver.prototype.toInt = function (obj) {

    return neo4j.int(obj);
};


/**
 * Closes session and bolt connection the Neo4J Server */

Driver.prototype.close = function () {

    this.session.close();
    this.neoDriver.close();
};

module.exports = Driver;
