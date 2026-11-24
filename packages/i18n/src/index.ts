// Spanish and English for the demo (ADR 0007).
// Everything is written in Spanish, in the code and in the seed. English comes from one catalog keyed by the Spanish
// text: exact lines first, then templates such as "Te faltan {n} bajas para {tier}", whose slots are translated in turn.
// The same function localizes API responses and the text the apps render, so content and screens never disagree.
import { CONTENT } from './content.ts';
import { UI } from './ui.ts';

export type Lang = 'es' | 'en';
export const LANGS: Lang[] = ['es', 'en'];
const KEY = 'eday-lang';

const storage = (): Storage | null => {
  try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; }
};

// Set by the mobile demo's loader, which resets the address before the app starts.
declare global { var __EDAY_LANG: string | undefined; var __EDAY_HOME: string | undefined }

const initial = (): Lang => {
  if (globalThis.__EDAY_LANG === 'en' || globalThis.__EDAY_LANG === 'es') return globalThis.__EDAY_LANG;
  try {
    const q = typeof location === 'undefined' ? null : new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'es') return q;
  } catch { /* no location outside the browser */ }
  return storage()?.getItem(KEY) === 'en' ? 'en' : 'es';
};

let lang: Lang = initial();
const listeners = new Set<(l: Lang) => void>();

export const getLang = () => lang;
export function setLang(next: Lang) {
  if (next === lang) return;
  lang = next;
  try { storage()?.setItem(KEY, next); } catch { /* private mode */ }
  for (const fn of listeners) fn(next);
}
/**
 * Change language in a browser build: remember it, tell the demo shell around the iframe, and reload so every
 * screen and every API answer comes back in the new language.
 */
export function switchLang(next: Lang) {
  setLang(next);
  if (typeof location === 'undefined') return;
  try { if (window.parent !== window) window.parent.postMessage({ type: 'eday-lang', lang: next }, '*'); } catch { /* cross-origin parent */ }
  const url = new URL(globalThis.__EDAY_HOME ?? location.href);
  url.searchParams.set('lang', next);
  location.replace(url.toString());
}
export const onLang = (fn: (l: Lang) => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

// ---------- catalog ----------
interface Rule { re: RegExp; slots: string[]; out: string; weight: number }
const exact = new Map<string, string>();
const SAME = new Set<string>();
const rules: Rule[] = [];
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function load(table: Record<string, string>) {
  for (const [key, en] of Object.entries(table)) {
    const es = key.normalize('NFC');
    if (!/\{\w+\}/.test(es)) { if (es === en) SAME.add(es); exact.set(es, en); continue; }
    const slots: string[] = [];
    const source = es.split(/(\{\w+\})/).map((part) => {
      const m = /^\{(\w+)\}$/.exec(part);
      if (!m) return escape(part);
      slots.push(m[1]);
      return '(.+?)';
    }).join('');
    rules.push({ re: new RegExp(`^${source}$`, 's'), slots, out: en, weight: es.replace(/\{\w+\}/g, '').length });
  }
}
load(CONTENT);
load(UI);
// The most specific template wins: the one with the most fixed text.
rules.sort((a, b) => b.weight - a.weight);

// ---------- dates ----------
const WD: Record<string, string> = { lun: 'Mon', mar: 'Tue', 'mié': 'Wed', mie: 'Wed', jue: 'Thu', vie: 'Fri', 'sáb': 'Sat', sab: 'Sat', dom: 'Sun' };
const WDL: Record<string, string> = { lunes: 'Monday', martes: 'Tuesday', 'miércoles': 'Wednesday', jueves: 'Thursday', viernes: 'Friday', 'sábado': 'Saturday', domingo: 'Sunday' };
const MO: Record<string, string> = { ene: 'Jan', feb: 'Feb', mar: 'Mar', abr: 'Apr', may: 'May', jun: 'Jun', jul: 'Jul', ago: 'Aug', sep: 'Sep', sept: 'Sep', oct: 'Oct', nov: 'Nov', dic: 'Dec' };
const DATE = /^(?:(lun|mar|mié|mie|jue|vie|sáb|sab|dom)\.? )?(\d{1,2}) (ene|feb|mar|abr|may|jun|jul|ago|sept?|oct|nov|dic)\.?(?: (\d{4}))?(?:,? (\d{1,2}:\d\d))?$/i;
function date(s: string): string | null {
  const m = DATE.exec(s);
  if (m) {
    const [, wd, d, mo, y, t] = m;
    return `${wd ? `${WD[wd.toLowerCase()]} ` : ''}${MO[mo.toLowerCase()]} ${d}${y ? `, ${y}` : ''}${t ? `, ${t}` : ''}`;
  }
  return WDL[s.toLowerCase()] ?? null;
}

// ---------- translate ----------
const cache = new Map<string, string | null>();
const HAS_WORD = /\p{L}{2}/u;
// Pieces that stay as they are: numbers, gamertags (Capi_Hierro) and names written the same in both languages.
const passThrough = (s: string) => !HAS_WORD.test(s) || (/^\S+$/.test(s) && /_|\d\p{L}|\p{L}\d/u.test(s)) || SAME.has(s) || UNITS.test(s);
// Screens put API answers, already in English, inside Spanish sentences. A piece with no Spanish in it is kept.
const SPANISH = /[áéíóúñ¿¡]|\b(de|del|la|las|los|el|en|con|tu|tus|un|una|unos|unas|para|por|que|y|o|sin|más|es|al|se|lo|le|su|sus|te|ya|hoy|mañana|cada|desde|hasta|todo|todas?|todos|semanas?|partidas?|bajas?|oleadas?|escuadras?|temporada|nivel(es)?|tienda|medallas?|logros?|horas?|victorias?|rango|mapas?|armas?|ver|plata|oro|bronce|noticias|retos|monedas|amigos|jugadores?|puntos|capítulos?|coleccionables?|serie|completas?|nuevo|nueva|mejor|juega|gana|consigue|supera|quedan?|faltan?|seguidores|miembros|objetos|reaparece|intentos?|raro|obtenido|revisada)\b/i;
const english = (s: string) => !SPANISH.test(s);
const UNITS = /^[#+\-−]?[\d.,]+\s?(km|min|h|XP|m|s|pts)?$/;
const SEPARATORS = [' · ', ': ', ' — ', ', ', ' / '];

/** English for one piece, or null when the catalog cannot say all of it. */
function piece(s: string, depth: number): string | null {
  if (passThrough(s)) return s;
  return core(s, depth) ?? (english(s) ? s : null);
}

function core(raw: string, depth: number): string | null {
  const s = raw.normalize('NFC');
  const hit = exact.get(s);
  if (hit !== undefined) return hit;
  const d = date(s);
  if (d) return d;
  if (depth > 6) return null;
  const known = depth === 0 ? cache.get(s) : undefined;
  if (known !== undefined) return known;
  const out = compose(s, depth);
  if (depth === 0) cache.set(s, out);
  return out;
}

function compose(s: string, depth: number): string | null {
  // Several sentences: each one on its own.
  const sentences = s.split(/(?<=[.!?])\s+(?=\S)/);
  if (sentences.length > 1) {
    const out = sentences.map((x) => sentence(x, depth + 1));
    if (out.every((x) => x !== null)) return out.join(' ');
  }
  // A template whose every slot can be said in English.
  for (const r of rules) {
    const m = r.re.exec(s);
    if (!m) continue;
    const values: Record<string, string> = {};
    let ok = true;
    r.slots.forEach((name, i) => {
      const v = piece(m[i + 1], depth + 1);
      if (v === null) ok = false; else values[name] = v;
    });
    if (ok) return r.out.replace(/\{(\w+)\}/g, (_, name: string) => values[name] ?? '');
  }
  if (sentences.length === 1 && /\.$/.test(s) && !/\.\.$/.test(s)) {
    const bare = piece(s.slice(0, -1), depth + 1);
    if (bare !== null) return `${bare}.`;
  }
  // Lines joined with a middle dot, a colon or a comma, part by part.
  // Joined parts may themselves form a phrase ("Ultra raro · 2%"), so the parts are grouped, preferring longer groups.
  for (const sep of SEPARATORS) {
    if (!s.includes(sep)) continue;
    const out = groups(s.split(sep), sep, depth + 1);
    if (out !== null) return out;
  }
  return null;
}

function groups(parts: string[], sep: string, depth: number): string | null {
  const memo = new Map<number, string | null>();
  const from = (i: number): string | null => {
    if (i === parts.length) return '';
    if (memo.has(i)) return memo.get(i)!;
    let found: string | null = null;
    for (let j = parts.length; j > i && found === null; j--) {
      // The whole line is the caller's job; here only proper sub-groups.
      if (i === 0 && j === parts.length) continue;
      const head = piece(parts.slice(i, j).join(sep), depth);
      if (head === null) continue;
      const rest = from(j);
      if (rest !== null) found = rest === '' ? head : head + sep + rest;
    }
    memo.set(i, found);
    return found;
  };
  return from(0);
}

const sentence = (x: string, depth: number) => piece(x, depth) ?? (x.endsWith('.') ? (() => { const b = piece(x.slice(0, -1), depth); return b === null ? null : `${b}.`; })() : null);

/** English for a Spanish line, or the line itself when the language is Spanish or nothing matches. */
export function translate(s: string, to: Lang = lang): string {
  if (to === 'es' || !HAS_WORD.test(s)) return s;
  // Surrounding space stays as it is; so does a dangling separator (a text node like " · Médico") when the catalog has no entry with it.
  for (const [head, tail] of EDGES) {
    const lead = head.exec(s)![0];
    if (lead.length === s.length) return s;
    const trail = tail.exec(s)![0];
    const out = core(s.slice(lead.length, s.length - trail.length), 0);
    if (out !== null) return lead + out + trail;
  }
  return s;
}

const EDGES = [[/^\s*/, /\s*$/], [/^[\s·—:,/]*/, /[\s·—:,/]*$/]] as const;

/** Shorthand for UI code. */
export const t = (s: string) => translate(s);

/** Every string in an API response, translated. Ids, dates and enum values have no Spanish words and pass through. */
export function localize<T>(value: T, to: Lang = lang): T {
  if (to === 'es') return value;
  const walk = (v: unknown, key: string): unknown => {
    if (typeof v === 'string') return SKIP.has(key) || CODE.test(v) ? v : translate(v, to);
    if (Array.isArray(v)) return v.map((x) => walk(x, key));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, k)]));
    return v;
  };
  return walk(value, '') as T;
}
// Names that are not words: gamertags, clan tags, ids, links.
// Enum values ("versus_tdm", "rifle") are codes, not words.
const CODE = /^[a-z0-9_]+$/;
const SKIP = new Set(['id', 'gamertag', 'hostGamertag', 'clanTag', 'timezone', 'url', 'link', 'launchUrl', 'avatar', 'image', 'country']);

/** What the catalog does not cover yet, for the coverage test. */
export const isTranslated = (s: string) => passThrough(s) || core(s.trim(), 0) !== null;
