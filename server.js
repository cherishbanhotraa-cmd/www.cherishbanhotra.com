const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { URL } = require('url');

const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const ROOT = __dirname;
const DATA_PATH = path.join(ROOT, 'data.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJson(res, code, data) {
  res.writeHead(code, { 'Content-Type': MIME['.json'] });
  res.end(JSON.stringify(data));
}

async function readData() {
  const text = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(text);
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function safePathFromUrl(urlPath) {
  const cleanPath = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.normalize(path.join(ROOT, cleanPath));
  if (!filePath.startsWith(ROOT)) return null;
  return filePath;
}

async function serveStatic(req, res, pathname) {
  const filePath = safePathFromUrl(pathname);
  if (!filePath) return sendJson(res, 403, { error: 'forbidden' });

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) return sendJson(res, 404, { error: 'not found' });
    const ext = path.extname(filePath).toLowerCase();
    const content = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    sendJson(res, 404, { error: 'not found' });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = url;

    if (req.method === 'GET' && pathname === '/api/dashboard') {
      return sendJson(res, 200, await readData());
    }

    if (req.method === 'PUT' && pathname === '/api/dashboard/profile') {
      const payload = await readBody(req);
      const data = await readData();
      data.profile = { ...data.profile, ...payload };
      await writeData(data);
      return sendJson(res, 200, data.profile);
    }

    if (req.method === 'POST' && pathname === '/api/dashboard/releases') {
      const payload = await readBody(req);
      if (!payload.title || !payload.artists) {
        return sendJson(res, 400, { error: 'title and artists are required' });
      }
      const data = await readData();
      data.releases.push({
        title: payload.title,
        artists: payload.artists,
        spotify: payload.spotify || '',
        youtube: payload.youtube || ''
      });
      await writeData(data);
      return sendJson(res, 201, data.releases);
    }

    if (req.method === 'DELETE' && pathname.startsWith('/api/dashboard/releases/')) {
      const index = Number.parseInt(pathname.split('/').pop(), 10);
      const data = await readData();
      if (Number.isNaN(index) || index < 0 || index >= data.releases.length) {
        return sendJson(res, 400, { error: 'invalid release index' });
      }
      data.releases.splice(index, 1);
      await writeData(data);
      return sendJson(res, 200, data.releases);
    }

    if (req.method === 'GET' && pathname === '/admin') {
      return serveStatic(req, res, '/admin.html');
    }

    return serveStatic(req, res, pathname);
  } catch (error) {
    return sendJson(res, 500, { error: 'server_error', message: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Dashboard running locally at http://localhost:${PORT}`);
});
