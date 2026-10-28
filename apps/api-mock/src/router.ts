// Minimal path router: "/sessions/{sessionId}/join" style templates, same as the contract.

export type Query = Record<string, string | undefined>;

export interface ApiRequest {
  method: string;
  path: string;
  query?: Query;
  body?: unknown;
  /** Who is signed in. The HTTP server reads it from the bearer token. */
  playerId: string;
}

export interface ApiResponse {
  status: number;
  body?: unknown;
}

export type Handler = (ctx: { params: Record<string, string>; query: Query; body: unknown; playerId: string }) => ApiResponse;

interface Route { method: string; template: string; pattern: RegExp; names: string[]; handler: Handler }

export function createRouter() {
  const routes: Route[] = [];
  const add = (method: string, template: string, handler: Handler) => {
    const names: string[] = [];
    const source = template.replace(/\{(\w+)\}/g, (_, name: string) => {
      names.push(name);
      return '([^/]+)';
    });
    routes.push({ method, template, pattern: new RegExp(`^${source}$`), names, handler });
  };
  const handle = (req: ApiRequest): ApiResponse => {
    const path = req.path.replace(/\/+$/, '') || '/';
    let pathMatched = false;
    for (const r of routes) {
      const m = r.pattern.exec(path);
      if (!m) continue;
      pathMatched = true;
      if (r.method !== req.method.toUpperCase()) continue;
      const params = Object.fromEntries(r.names.map((n, i) => [n, decodeURIComponent(m[i + 1])]));
      return r.handler({ params, query: req.query ?? {}, body: req.body, playerId: req.playerId });
    }
    return pathMatched ? error(405, 'method_not_allowed', `${req.method} no está permitido en ${path}`) : error(404, 'not_found', `No existe ${path}`);
  };
  return { add, handle, routes };
}

export const ok = (body: unknown, status = 200): ApiResponse => ({ status, body });
export const noContent = (): ApiResponse => ({ status: 204 });
export const error = (status: number, code: string, message: string): ApiResponse => ({ status, body: { code, message } });
