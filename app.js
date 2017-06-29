'use strict';

require('dotenv').config();
const Hapi = require('hapi');
const Pino = require('hapi-pino');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Jwt = require('hapi-auth-jwt2');
const Package = require('./package.json');
const Pack = require('./package');
const Validate = require('./bin/validate').validate;
const Features = require('./bin/features');
const PreControllers = require('./bin/precontrollers');

const server = new Hapi.Server();

server.connection({
    routes: {
        cors: true,
        cache: {
            privacy: 'public',
            expiresIn: 3 * 3600 // 3 hours, ease the load on neo4j as the data is not changing much
        }
    },
    host: '0.0.0.0',
    port: process.env.NEO_DRIVER_PORT || Package.config.openPort,
    router: {
        isCaseSensitive: true,
        stripTrailingSlash: true
    },
    labels: 'api'
});

const options = {
    info: {
        title: 'Neo4J Radar Driver API',
        version: Pack.version
    },
    documentationPath: '/radar/api',
    swaggerUIPath: '/radar/swaggerui/',
    jsonPath: '/radar/swagger.json'
};

server.register([
    Pino,
    Inert,
    Vision,
    Jwt,
    {
        'register': HapiSwagger,
        options
    }
],
    (err) => {

        if (err) {
            server.log(err);
        }
    }
);


server.auth.strategy('jwt', 'jwt', 'try', {
    key: process.env.secretKey,
    cookieKey: 'Authorization',
    validateFunc: Validate,
    verifyOptions: {
        algorithms: ['HS256']
    }
});

// Temporary way of authorization using jwt tokens
server.state('Authorization', {
    encoding: 'none',
    isHttpOnly: false,
    isSecure: false,
    ttl: 1000 * 60 * 30
});

// Dynamically creates the server state to accept all feature toggle cookies.
Features.map((feature) => {

    server.state(feature.name, {
        encoding: 'none',
        isHttpOnly: false,
        isSecure: false
    });
});

server.views({
    engines: {
        pug: require('pug')
    },
    path: __dirname + '/templates',
    compileOptions: {
        pretty: false
    }
});


// Add routes
const Routes = require('./routes');

//This will add the features pre-controller to all routes to make sure we have access to those toggles
Routes.map((item) => {

    if (typeof (item.config.pre) !== 'undefined') {
        item.config.pre.unshift({
            method: PreControllers.gather_features,
            assign: 'features'
        });
    }
    else {
        item.config.pre = [
            {
                method: PreControllers.gather_features,
                assign: 'features'
            }
        ];
    }


});

server.route(Routes);
server.start((err) => {

    if (err) {
        server.log(err);
    }
    else {
        server.log('Server running at:', server.info.uri);
    }

});


module.exports = server;
