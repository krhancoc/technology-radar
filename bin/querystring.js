'use strict';
const Path = require('path');
const ValidActions = require(Path.join(__dirname, 'valid_actions'));

/**
 * Creates a valid Cypher Query for Neo4J
 * @example <caption>Example of creating a Cypher Query</caption>
 * // returns 'MATCH (n:BLIP) MATCH (n:`2017-03`) RETURN (n)
 * CreateQueryString('blips', {
 *  publicationDate: '2017-03'
 * });
 * @param {String} command The base command needed to create a Cypher Query String
 * @param {{}} parameters The paramaters passed for the base command.
 * @returns {string} The Cypher string
 */
const CreateQueryString = function (command, parameters) {

    const query = [ValidActions[command].hook];
    let search_flag = false;
    let search_param = '';
    for (const i in parameters) {
        if (i === 'search') {
            search_flag = true;
            search_param = parameters[i];
        }
        else {
            if (typeof ValidActions[command][i] === 'function') {
                query.push(ValidActions[command][i](parameters[i]));
            }
        }
    }
    //The search parameter needs to be pushed to the last query in the string.
    if (search_flag) {
        query.push(ValidActions[command].search(search_param));
    }
    query.push(ValidActions[command].return);
    return query.join(' ');
};

module.exports = CreateQueryString;
