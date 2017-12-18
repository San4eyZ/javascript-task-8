'use strict';

const http = require('http');
const { parse: parseUrl } = require('url');
const { parse: parseQuery } = require('querystring');

let storedMessages = [];

const server = http.createServer((req, res) => {
    const urlObj = parseUrl(req.url);
    if (urlObj.pathname === '/favicon.ico') {
        return sendNotFound(res);
    }
    if (urlObj.pathname !== '/messages') {
        return sendNotFound(res);
    }

    const { from, to } = parseQuery(urlObj.query);

    if (req.method === 'GET') {
        try {
            res.writeHead(200, { 'Content-type': 'application/json' });
            res.write(JSON.stringify(getMessages(from, to, storedMessages.map(JSON.parse))));
        } catch (e) {
            return sendNotFound(res);
        }
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
});

function getMessages(from, to, messageList) {
    let filteredMessages = messageList.filter(function (message) {
        return (from ? message.from === from : true) && (to ? message.to === to : true);
    });
    if (!filteredMessages.length) {
        throw new Error('Сообщения не найдены');
    }

    return filteredMessages;
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

function sendNotFound(response) {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('404 Not Found');
}

module.exports = server;

