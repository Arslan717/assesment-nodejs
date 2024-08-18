const http = require('http');
const https = require('https');
const url = require('url');

function fetchTitle(address) {
    return new Promise((resolve) => {
        let parsedUrl = url.parse(address);
        let protocol = parsedUrl.protocol === 'https:' ? https : http;

        protocol.get(address, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                let match = data.match(/<title>([^<]*)<\/title>/);
                if (match && match[1]) {
                    resolve(`${address} - "${match[1]}"`);
                } else {
                    resolve(`${address} - NO TITLE FOUND`);
                }
            });
        }).on('error', () => {
            resolve(`${address} - NO RESPONSE`);
        });
    });
}

http.createServer((req, res) => {
    if (req.url.startsWith('/I/want/title')) {
        let queryData = url.parse(req.url, true).query;
        let addresses = queryData.address instanceof Array ? queryData.address : [queryData.address];

        Promise.all(addresses.map(fetchTitle))
            .then(results => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write('<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>');
                results.forEach(result => {
                    res.write(`<li>${result}</li>`);
                });
                res.write('</ul></body></html>');
                res.end();
            });

    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('404 Not Found');
    }
}).listen(3000, () => console.log('Server running on port 3000'));
