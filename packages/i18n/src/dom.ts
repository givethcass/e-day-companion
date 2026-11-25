// Translates what a web build renders, in place, so screens written in Spanish read in English.
// Only text node contents and a few attributes change; React keeps owning the nodes, and when it writes new
// Spanish text the observer translates it again. Switching back restores the Spanish it remembered.
import { getLang, onLang, translate, type Lang } from './index.ts';

const ATTRS = ['aria-label', 'placeholder', 'title', 'alt'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'TEXTAREA']);
interface Seen { src: string; out: string }
const texts = new WeakMap<Text, Seen>();
const attrs = new WeakMap<Element, Map<string, Seen>>();

function doText(node: Text, lang: Lang) {
  const seen = texts.get(node);
  const src = seen && node.data === seen.out ? seen.src : node.data;
  const out = translate(src, lang);
  texts.set(node, { src, out });
  if (node.data !== out) node.data = out;
}

function doAttrs(el: Element, lang: Lang) {
  for (const name of ATTRS) {
    const v = el.getAttribute(name);
    if (v === null) continue;
    let map = attrs.get(el);
    if (!map) attrs.set(el, (map = new Map()));
    const seen = map.get(name);
    const src = seen && v === seen.out ? seen.src : v;
    const out = translate(src, lang);
    map.set(name, { src, out });
    if (v !== out) el.setAttribute(name, out);
  }
}

function walk(root: Node, lang: Lang) {
  if (root.nodeType === Node.TEXT_NODE) return doText(root as Text, lang);
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
  if (root.nodeType === Node.ELEMENT_NODE) {
    if (SKIP_TAGS.has((root as Element).tagName) || (root as Element).closest('[data-no-translate]')) return;
    doAttrs(root as Element, lang);
  }
  const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: (n) => (n.nodeType === Node.ELEMENT_NODE && (SKIP_TAGS.has((n as Element).tagName) || (n as Element).hasAttribute('data-no-translate'))
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n = it.nextNode(); n; n = it.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) doText(n as Text, lang);
    else doAttrs(n as Element, lang);
  }
}

let started = false;
/** Start translating the page. Safe to call more than once. */
export function startDomTranslation(root: Node = document.body) {
  if (started || typeof document === 'undefined') return;
  started = true;
  const apply = () => {
    document.documentElement.lang = getLang();
    observer.disconnect();
    walk(root, getLang());
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  };
  const observer = new MutationObserver((records) => {
    const lang = getLang();
    observer.disconnect();
    for (const r of records) {
      if (r.type === 'characterData') doText(r.target as Text, lang);
      else if (r.type === 'attributes') doAttrs(r.target as Element, lang);
      else r.addedNodes.forEach((n) => walk(n, lang));
    }
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  });
  onLang(apply);
  apply();
}
