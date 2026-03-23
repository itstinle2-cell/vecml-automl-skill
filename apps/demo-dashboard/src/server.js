import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');
const workspaceRoot = path.resolve(__dirname, '..', '..', '..');

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      return sendFile(res, path.join(publicDir, 'index.html'), 'text/html');
    }

    if (req.method === 'GET' && req.url === '/app.js') {
      return sendFile(res, path.join(publicDir, 'app.js'), 'application/javascript');
    }

    if (req.method === 'POST' && req.url === '/api/computer-use') {
      const body = await readJson(req);
      const prompt = body.prompt || "Open a browser, search for 'Wikipedia OpenAI', and summarize the first result";
      const output = await runNode(path.join(workspaceRoot, 'src', 'cli.js'), [prompt], workspaceRoot);
      return sendJson(res, { ok: true, output });
    }

    if (req.method === 'POST' && req.url === '/api/memory') {
      const body = await readJson(req);
      const prompt = body.prompt || 'What did I say about my project yesterday?';
      const appDir = path.join(workspaceRoot, 'projects', 'personal-memory-assistant');
      const dataPath = path.join(appDir, 'data', 'conversations.jsonl');
      if (!fs.existsSync(dataPath) || !fs.readFileSync(dataPath, 'utf8').trim()) {
        await runNode(path.join(appDir, 'src', 'seed.js'), [], appDir);
      }
      const output = await runNode(path.join(appDir, 'src', 'cli.js'), [prompt], appDir);
      return sendJson(res, { ok: true, output });
    }

    if (req.method === 'POST' && req.url === '/api/multi-agent') {
      const body = await readJson(req);
      const prompt = body.prompt || 'Analyze Tesla stock';
      const appDir = path.join(workspaceRoot, 'projects', 'multi-agent-system');
      const output = await runNode(path.join(appDir, 'src', 'cli.js'), [prompt], appDir);
      return sendJson(res, { ok: true, output });
    }

    res.statusCode = 404;
    res.end('Not found');
  } catch (error) {
    sendJson(res, { ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

server.listen(3000, () => {
  console.log('Demo dashboard running at http://localhost:3000');
});

async function runNode(scriptPath, args, cwd) {
  const { stdout, stderr } = await execFileAsync('node', [scriptPath, ...args], {
    cwd,
    maxBuffer: 1024 * 1024 * 20
  });
  return (stdout || stderr).trim();
}

function sendFile(res, filePath, type) {
  res.statusCode = 200;
  res.setHeader('Content-Type', type);
  res.end(fs.readFileSync(filePath));
}

function sendJson(res, data, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}
