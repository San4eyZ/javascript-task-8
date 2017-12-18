'use strict';

module.exports.execute = execute;
module.exports.isStar = false;

const rp = require('request-promise');
const chalk = require('chalk');
const getArgs = require('minimist');

function execute() {
    const action = process.argv[2];
    const { from, to, text } = getArgs(process.argv.slice(3));

    if (!action) {
        return Promise.reject('Не указана команда');
    }
    if (action === 'send' && !text) {
        return Promise.reject('Не введен текст сообщения');
    }

    let options = {
        url: 'http://localhost:8080/messages',
        method: action === 'list' ? 'GET' : 'POST',
        qs: { from, to },
        body: { text },
        json: true,
        headers: action === 'send' ? {
            'Content-type': 'application/json'
        } : {}
    };

    return rp(options)
        .then(body => {
            if (body instanceof Array) {
                return body.map(forFancyPrint).join('\n\n');
            }

            return forFancyPrint(body);
        });
}

function forFancyPrint(message) {
    return (message.from ? `${chalk.hex('#f00')('FROM')}: ${message.from}\n` : '') +
        (message.to ? `${chalk.hex('#f00')('TO')}: ${message.to}\n` : '') +
        (message.text ? `${chalk.hex('#0f0')('TEXT')}: ${message.text}` : '');
}
