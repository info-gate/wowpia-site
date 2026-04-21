import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';

const ROOT = 'c:/app/wowpia-site';
const PORT = 8765;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/') p = '/index.html';
    const full = join(ROOT, p);
    const body = await readFile(full);
    res.writeHead(200, { 'Content-Type': mime[extname(p)] || 'application/octet-stream' });
    res.end(body);
  } catch (e) {
    res.writeHead(404);
    res.end('404');
  }
});
server.listen(PORT, () => console.log(`Serving ${ROOT} on http://localhost:${PORT}`));
