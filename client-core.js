'use strict';

module.exports.execute = execute;
module.exports.isStar = false;

const supportedKeys = ['--from', '--to', '--text'];
const rp = require('request-promise');
const chalk = require('chalk');

function execute() {
    const args = process.argv.slice(2);
    const { action, from, to, text } = processArgs(args);

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
        .then(body => forFancyPrint(body));
}

function processArgs(args) {
    let paramObject = { action: args[0] };
    let i = 1;
    while (i < args.length) {
        let param = args[i];
        let [key, value] = param.split('=');
        if (supportedKeys.includes(key) && value === undefined && args[i + 1]) {
            paramObject[key.slice(2)] = args[i + 1];
            i = i + 2;
            continue;
        }
        if (supportedKeys.includes(key) && value) {
            paramObject[key.slice(2)] = value;
            i++;
            continue;
        }
        i = args[i + 1] ? i + 1 : i + 2;
    }

    return paramObject;
}

function forFancyPrint(messages) {
    if (messages instanceof Array) {
        return messages.map(message => {
            return (message.from ? `${chalk.hex('#f00')('FROM')}: ${message.from}\n` : '') +
                (message.to ? `${chalk.hex('#f00')('TO')}: ${message.to}\n` : '') +
                (message.text ? `${chalk.hex('#0f0')('TEXT')}: ${message.text}` : '');
        }).join('\n\n');
    }

    return (messages.from ? `${chalk.hex('#f00')('FROM')}: ${messages.from}\n` : '') +
        (messages.to ? `${chalk.hex('#f00')('TO')}: ${messages.to}\n` : '') +
        (messages.text ? `${chalk.hex('#0f0')('TEXT')}: ${messages.text}` : '');
}
