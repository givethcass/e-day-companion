// HTTP server for the simulated backend: `npm start -w @eday/api-mock`, then
// curl -H 'Authorization: Bearer demo:p_demo' localhost:8787/v0/me/week
import { createServer } from 'node:http';
import { createApi } from './api.ts';

const api = createApi();
const port = Number(process.env.PORT ?? 8787);
const BASE = '/v0';

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return void res.writeHead(204).end();

  const url = new URL(req.url ?? '/', 'http://localhost');
  const send = (status: number, body?: unknown) => {
    if (body === undefined) return void res.writeHead(status).end();
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));
  };
  if (url.pathname === `${BASE}/auth/demo` && req.method === 'POST') return send(200, api.signIn());
  if (!url.pathname.startsWith(BASE)) return send(404, { code: 'not_found', message: 'Usa el prefijo /v0' });

  const playerId = api.playerIdFromToken(req.headers.authorization?.replace(/^Bearer /, ''));
  if (!playerId) return send(401, { code: 'unauthorized', message: 'Falta el token de la sesión simulada (POST /v0/auth/demo)' });

  let body: unknown;
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  if (chunks.length) {
    try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return send(400, { code: 'bad_request', message: 'JSON inválido' }); }
  }
  const { status, body: out } = api.handle({
    method: req.method ?? 'GET', path: url.pathname.slice(BASE.length), query: Object.fromEntries(url.searchParams), body, playerId,
  });
  send(status, out);
});

server.listen(port, () => console.log(`Simulated E-Day API on http://localhost:${port}${BASE} (demo clock ${api.demoNow})`));
