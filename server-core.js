'use strict';

const http = require('http');
const { parse: parseUrl } = require('url');
const { parse: parseQuery } = require('querystring');

let storedMessages = [];

const server = http.createServer((req, res) => {
    const urlObj = parseUrl(req.url);
    if (urlObj.pathname !== '/messages') {
        res.statusCode = 404;
        res.end();

        return;
    }
    const { from, to } = parseQuery(urlObj.query);

    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(getMessages(from, to, storedMessages)));
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        }).on('end', () => {
            let message = formatMessage({ from, to, text: JSON.parse(body).text });

            storedMessages.push(message);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(message));
        });
    }
});

function getMessages(from, to, messageList) {
    return messageList.filter(message => {
        return (from ? message.from === from : true) && (to ? message.to === to : true);
    });
}

function formatMessage(messageObj) {
    let formattedMessage = {};
    for (let prop of Object.keys(messageObj)) {
        if (messageObj[prop]) {
            formattedMessage[prop] = messageObj[prop];
        }
    }

    return formattedMessage;
}

module.exports = server;

