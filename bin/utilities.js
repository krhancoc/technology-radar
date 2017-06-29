'use strict';

/**
 * This object contains functions that are consistently used by the API
 * @static
 * @namespace Utilities
 */
const Utilities = {
    /**
     * Cleans JSON objects so all values in the object are not URI encoded, or will decode any string passed to it
     * @example <caption>Sanitizing strings</caption>
     * // returns '/radar/person/Mark M./proposed'
     * Utilities.sanitize('/radar/person/Mark%20M./proposed');
     * @example <caption> Sanitizing JSON</caption>
     * // returns {name: '/radar/person/Mark M./proposed'}
     * Utilities.sanitize({
     *  name: '/radar/person/Mark%20M./proposed'
     * });
     * @param {{}} obj Object to be decoded
     * @returns {*} Returns the URI decoded object or string
     * @memberOf Utilities
     */
    sanitize: (obj) => {

        switch (typeof (obj)) {
            case 'string':
                obj = decodeURIComponent(obj);
                break;
            case 'object':
                for (const i in obj) {
                    if (obj[i] !== null) {
                        obj[i] = decodeURIComponent(obj[i]);
                    }
                    else {
                        delete obj[i];
                    }
                }
                break;
            default:
                throw new Error(`Cannot Sanatize type of: ${typeof (obj)}`);
        }
        return obj;
    },

    sluggify: (string) => {

        let build = string.toLowerCase();
        build = build.charAt(0) === '.' ? build.substr(1) : build;
        return build
            .split(' ').join('-')
            .split(',').join('-')
            .split('\'').join('-')
            .split('.').join('-')
            .split(/\-{2,}/).join('-'); //Case where after replacements may be more then one dash beside each other
    },

    /**
     * Simple merge function which merges to JSON objects as long as they do not share any similar keys, a and b are not
     * modified
     * @example <caption>Merging two objects</caption>
     * let a = {
     *  foo: 'bar'
     * }
     *
     * let b = {
     *  hello: 'world'
     * }
     *
     * Utilities.merge(a,b)
     * // returns {foo: 'bar', hello: 'world'}
     * @param {{}} a Object to be merged
     * @param {{}} b Object to be merged
     * @returns {{}} Returns a NEW object of the merged objects.
     * @memberOf Utilities
     */
    merge: (a, b) => {

        const n = {};
        for (const i in b) {
            if (i in a) {
                throw new Error(`Cannot Merge objects with shared keys: ${i}`);
            }
            n[i] = b[i];
        }
        for (const i in a) {
            n[i] = a[i];
        }
        return n;
    },
    /**
     * This converts the Neo4J JSON response into something more readable and strips away the data that is not needed
     * @param {{}} obj Original JSON object passed by Neo4J
     * @returns {Array.<*>} Returns an array of JSON objects, this could be an array of blips, contributors, or meetings for
     * example.
     * @memberOf Utilities
     */
    clean_response: (obj) => {

        const organize = (elem) => {

            const x = elem.properties;
            x.labels = 'labels' in Object.keys(elem) ? [] : elem.labels;
            x.id = elem.identity.low;
            return x;
        };

        if (obj.records.length === 0) {
            return null;
        }

        if (obj.records.length > 1) {
            return obj.records.map((elem) => {

                return organize(elem._fields[0]);
            });
        }
        const values = obj.records[0]._fields[0];

        if (!isNaN(values)) {
            return values;
        }

        if (Object.prototype.toString.call(values) !== '[object Array]') {
            return organize(values);
        }
        return obj.records[0]._fields[0].map(organize)
            .sort((a, b) => {

                if ('support' in a && 'support' in b) {
                    return parseFloat(b.support.slice(0, -1)) - parseFloat(a.support.slice(0, -1));
                }
                else if ('support' in a) {
                    return -1;
                }
                else if ('support' in b) {
                    return 1;
                }
                return 0;
            });
    },

    /**
     * This will group a list of JSON objects (or any object) by a specific value defined by the user
     *
     * Created for fun :)
     *
     * @example Example of a JSON object
     * let example = [
     *    {
     *      name: 'hello'
     *    },
     *    {
     *      name: 'team'
     *    }
     * ];
     * let grouped = groupBy(example, 'name.charAt.toUpperCase', [0,null]);
     * // Returns the object where 'H' and 'T' are valid keys.
     * Output = {
     *      H: [ { name: 'hello'}],
     *      T: [ { name: 'team'}],
     * }
     * @example Example using strings
     *  const l = ['hello', 'hellz', 'foobar', 'foo'];
     *
     * const expected = {
     *  HE: ['hello', 'hellz'],
     *  FO: ['foobar', 'foo']
     *};
     *
     * groupBy(l,'substring.toUpperCase',[[0,2],null]) == expected;
     * //returns true
     * @param {Array} list List of objects
     * @param {string} func Period seperated function calls or key calls
     * @param {Array} passIn list of values that will be passed into whatever functions are encountered in the func string
     * ORDER DOES MATTER
     * @returns {{}} Dictionary object with each key being the value you specified by user, and key values being the objects
     * that fall into that category.
     * @memberOf Utilities
     *
     */
    groupBy: (list, func, passIn) => {

        const isIterable = (object) => {

            return object !== null && typeof object[Symbol.iterator] === 'function';
        };
        if (list.length === 0) {
            return {};
        }

        return list.reduce((acc, val) => {

            const calls = func.split('.');
            let p = 0;
            const t = calls.reduce((a, c) => {

                if (typeof a[c] === 'function') {
                    const f = a[c].bind(a);
                    return f.apply(f, isIterable(passIn[p]) ? passIn[p] : [passIn[p++]]);
                }
                return a[c];
            }, val);
            if (t in acc) {
                acc[t].push(val);
            }
            else {
                acc[t] = [val];
            }
            return acc;
        }, {});
    }
};

module.exports = Utilities;
