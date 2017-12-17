'use strict';

const http = require('http');
const fs = require('fs');
const { parse: parseUrl } = require('url');
const { parse: parseQuery } = require('querystring');

const messageFile = 'messages.txt';

const server = http.createServer((req, res) => {
    const urlObj = parseUrl(req.url);
    if (urlObj.pathname === '/favicon.ico') {
        return res.end();
    }
    if (urlObj.pathname !== '/messages') {
        return sendNotFound(res);
    }

    const { from, to } = parseQuery(urlObj.query);

    if (req.method === 'GET') {
        fs.readFile(messageFile, 'utf-8', (err, content) => {
            if (err) {
                return sendNotFound(res);
            }
            let messageList = content.split('\n');
            messageList.pop();
            try {
                res.writeHead(200, { 'Content-type': 'application/json' });
                res.write(JSON.stringify(getMessages(from, to, messageList.map(JSON.parse))));
            } catch (e) {
                res.write(e.message);
            }
            res.end();
        });
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        }).on('end', () => {
            let message = formatMessage(from, to, JSON.parse(body).text);

            fs.appendFile(messageFile, message + '\n');
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

