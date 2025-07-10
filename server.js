const { createServer } = require('http');
const { readFileSync, existsSync } = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

createServer((req, res) => {
  const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const mime = MIME_TYPES[ext] || 'text/plain';

  if (existsSync(filePath)) {
    res.writeHead(200, { 'Content-Type': mime });
    res.end(readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('404: File not found');
  }
}).listen(3000, () => console.log('Server running at http://localhost:3000'));

