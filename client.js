/* eslint-disable no-console */
'use strict';

const { execute } = require('./client-core');

module.exports.isStar = true;

try {
    execute()
        .then(console.log)
        .catch(console.error);
} catch (e) {
    console.error(e.message);
}

