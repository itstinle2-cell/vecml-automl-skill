import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const port = Number(process.env.PORT || 3010);
const siteDir = path.join(process.cwd(), 'site');

const server = http.createServer((req, res) => {
  const filePath = req.url === '/' ? path.join(siteDir, 'index.html') : path.join(siteDir, req.url);
  try {
    const data = fs.readFileSync(filePath);
    const type = filePath.endsWith('.html') ? 'text/html' : 'text/plain';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`AI researcher site running at http://localhost:${port}`);
});
