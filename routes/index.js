'use strict';
/** @namespace Routes */
const Fs = require('fs');
const Path = require('path');

/*
 * Route loader.
 * Take all the js files in the /routes folder and bring the arrays
 * together into a single Route module for the server to load.
 */
const GatherRoutes = function (path) {

    const routeFiles = Fs.readdirSync(path);
    const AllRoutes = [];
    routeFiles.forEach((currentValue, index) => {

        if (currentValue !== 'index.js' && !currentValue.includes('.swp')) { // skip this file and Vim Temp files
            if (Fs.lstatSync(Path.join(path, currentValue)).isDirectory()) {
                AllRoutes.push.apply(AllRoutes, GatherRoutes(Path.join(path, currentValue)));
            }
            else {
                const innerValue = require(Path.join(path, currentValue));
                AllRoutes.push(innerValue);
            }
        }
    });
    return AllRoutes;
};

module.exports = GatherRoutes(__dirname);
