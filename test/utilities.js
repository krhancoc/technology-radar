'use strict';

const Path = require('path');
const Code = require('code');
const TestHelpers = require(Path.join(__dirname, '..', 'test_resources', 'helper'));
const _ = require(Path.join(__dirname, '..', 'bin', 'utilities'));
const expect = Code.expect;
const Server = TestHelpers.server;
const driver = TestHelpers.driver;

describe('Utilities', () => {

    describe('Sanatize function', () => {

        it('Should do nothing to a valid JSON object', (done) => {

            const pass = {
                hello: 'world',
                foo: 'bar'
            };
            expect(_.sanitize(pass)).to.equal(pass);
            done();
        });

        it('Should sanatize a string', (done) => {

            const pass = 'meeting%2F2017-02-28%2Fproposed';
            expect(_.sanitize(pass)).to.equal('meeting/2017-02-28/proposed');
            done();
        });

        it('Should delete all null valued keys and Sanatize values', (done) => {

            const pass = {
                foo: 'meeting%2F2017-02-28%2Fproposed',
                bar: null
            };
            expect(_.sanitize(pass)).to.equal({
                foo: 'meeting/2017-02-28/proposed'
            });
            done();
        });
        it('Should error when trying to sanatize not a string or json object', (done) => {

            expect(_.sanitize.bind(null, 0)).to.throw(Error);
            done();
        });
    });
    describe('Merge function', () => {

        it('Should merge two objects together', (done) => {

            const a = {
                foo: 'bar'
            };
            const b = {
                hello: 'world'
            };
            expect(_.merge(a, b)).to.equal({
                foo: 'bar',
                hello: 'world'
            });
            done();
        });
        it('Should error when a key is shared between the two objects', (done) => {

            const a = {
                foo: 'bar'
            };
            const b = {
                foo: 'bar'
            };
            expect(_.merge.bind(null, a, b)).to.throw(Error);
            done();
        });
    });

    describe('groupBy Function', () => {

        it('Should group by functional call', (done) => {

            const l = [
                {
                    name: 'hello'
                },
                {
                    name: 'world'
                },
                {
                    name: 'here'
                }
            ];

            const expected = {
                H: [
                   { name: 'hello' }, { name: 'here' }
                ],
                W: [{ name: 'world' }]
            };
            expect(_.groupBy(l,'name.charAt.toUpperCase',[0,null])).to.equal(expected);
            done();
        });

        it('Should group by functional call', (done) => {

            const l = [
                {
                    name: 'hello'
                },
                {
                    name: 'world'
                },
                {
                    name: 'here'
                }
            ];

            expect(_.groupBy.bind(l,'name.charAt.toUpperCase',[null, 0])).to.throw(Error);
            done();
        });

        it('Should group any list really...', (done) => {

            const l = ['hello', 'hellz', 'foobar', 'foo'];

            const expected = {
                HE: ['hello', 'hellz'],
                FO: ['foobar', 'foo']
            };

            expect(_.groupBy(l,'substring.toUpperCase',[[0,2],null])).to.equal(expected);
            done();
        });
    });

    describe('Sluggify function should', () => {

        it('succeed on empty string', (done) => {

            expect(_.sluggify('')).to.equal('');
            done();
        });

        it('turn a string into a sluggified string', (done) => {

            expect(_.sluggify('.HELLO,TEAM .NET node.js')).to.equal('hello-team-net-node-js');
            done();
        });
    });

});
