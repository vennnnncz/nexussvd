// Pratinjau hasil build (dist/) dengan fallback SPA. Jalankan setelah `npm run build`.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const root = 'dist';
const port = Number(process.env.PORT) || 4173;

createServer((req, res) => {
  const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, path);
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html');
  res.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
  res.end(readFileSync(file));
}).listen(port, () => console.log(`Preview: http://localhost:${port}`));
