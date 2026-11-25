// Every line the simulated API can answer has an English version, and the engine keeps names and numbers as they are.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTranslated, translate } from '../src/index.ts';
import { crawl } from './crawl.ts';

// Proper names that read the same in both languages, and enum values, which answers keep as codes.
const NAMES = new Set(['NRT']);
const CODE = /^[a-z0-9_]+$/;
const kept = (s: string) => NAMES.has(s) || CODE.test(s);

test('every API string has English', () => {
  const missing = [...crawl('es')].filter(([s]) => !kept(s) && !isTranslated(s));
  assert.deepEqual(missing.slice(0, 20), [], `${missing.length} strings without English`);
});

test('English API answers carry no untranslated Spanish', () => {
  const es = crawl('es');
  const en = crawl('en');
  assert.ok(en.size > 1000);
  for (const [s] of es) if (!kept(s) && translate(s, 'en') !== s) assert.ok(!en.has(s), `still Spanish in English: ${s}`);
});

test('templates, dates and composite lines', () => {
  const cases: [string, string][] = [
    ['T1 · Semana 4 de 8', 'S1 · Week 4 of 8'],
    ['mar 3 nov, 09:00 tu hora', 'Tue Nov 3, 09:00 your time'],
    ['Obtenido el lun 26 oct · Ultra raro · 2%', 'Earned Mon Oct 26 · Ultra rare · 2%'],
    ['1 intento · mejor partida 39 bajas · unos 42 min', '1 attempt · best match 39 kills · about 42 min'],
    [' · Médico', ' · Medic'],
  ];
  for (const [es, en] of cases) assert.equal(translate(es, 'en'), en);
});

test('names, codes and Spanish mode pass through', () => {
  for (const s of ['Delta_Rojo', 'NRT', '3.26', '12 km', 'De', 'Tu']) assert.equal(translate(s, 'en'), s);
  assert.equal(translate('Semana 4', 'es'), 'Semana 4');
});
