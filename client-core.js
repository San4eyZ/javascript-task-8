'use strict';

module.exports.execute = execute;
module.exports.isStar = false;

const supportedKeys = ['--from', '--to', '--text'];
const http = require('http');
const chalk = require('chalk');

function execute() {
    // Внутри этой функции нужно получить и обработать аргументы командной строки
    const args = process.argv.slice(2);
    const { action, from, to, text } = processArgs(args);
    const url = makeUrl(from, to);

    if (!action) {
        throw new Error('Не указана команда');
    }
    if (action === 'send' && !text) {
        throw new Error('Не введен текст сообщения');
    }

    let options = {
        hostname: 'localhost',
        port: 8080,
        path: url,
        method: action === 'list' ? 'GET' : 'POST',
        headers: action === 'list' ? {} : { 'Content-Type': 'application/json; charset=utf-8' }
    };

    return new Promise((resolve) => {
        let req = http.request(options, response => {
            let messages = '';
            response.on('data', chunk => {
                messages += chunk;
            }).on('end', () => {
                resolve(forFancyPrint(JSON.parse(messages)));
            });
        });
        if (options.method === 'POST') {
            req.write(`{"text": "${text}"}`);
        }
        req.end();
    });
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

function makeUrl(from, to) {
    if (!from && !to) {
        return '/messages';
    }
    if (!from) {
        return '/messages?to=' + to;
    }
    if (!to) {
        return '/messages?from=' + from;
    }

    return `/messages?from=${from}&to=${to}`;
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
