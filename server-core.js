'use strict';

const http = require('http');
const { parse: parseUrl } = require('url');
const { parse: parseQuery } = require('querystring');

let storedMessages = [];

const server = http.createServer((req, res) => {
    const urlObj = parseUrl(req.url);
    if (urlObj.pathname === '/messages') {
        const { from, to } = parseQuery(urlObj.query);

        if (req.method === 'GET') {
            res.writeHead(200, { 'Content-type': 'application/json' });
            res.write(JSON.stringify(getMessages(from, to, storedMessages.map(JSON.parse))));

            res.end();
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            }).on('end', () => {
                let message = formatMessage(from, to, JSON.parse(body).text);

                storedMessages.push(message);
                res.writeHead(200, { 'Content-type': 'application/json' });
                res.end(message);
            });
        }
    } else {
        res.statusCode = 404;
        res.end();
    }
});

function getMessages(from, to, messageList) {
    return messageList.filter(function (message) {
        return (from ? message.from === from : true) && (to ? message.to === to : true);
    });
}

function formatMessage(from, to, text) {
    if (!from && !to) {
        return JSON.stringify({ text });
    }
    if (!from) {
        return JSON.stringify({ to, text });
    }
    if (!to) {
        return JSON.stringify({ from, text });
    }

    return JSON.stringify({ from, to, text });
}

module.exports = server;

