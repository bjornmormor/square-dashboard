javascriptconst https = require('https');
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Square-Version');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const fs = require('fs');
    res.end(fs.readFileSync('./index.html'));
    return;
  }

  if (req.url.startsWith('/square/')) {
    const squarePath = req.url.replace('/square', '');
    const options = {
      hostname: 'connect.squareup.com',
      path: squarePath,
      method: req.method,
      headers: {
        'Authorization': req.headers['authorization'],
        'Square-Version': '2024-01-17',
        'Content-Type': 'application/json'
      }
    };

    const proxy = https.request(options, (squareRes) => {
      res.writeHead(squareRes.statusCode, { 'Content-Type': 'application/json' });
      squareRes.pipe(res);
    });

    proxy.on('error', (e) => {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    });

    req.pipe(proxy);
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
