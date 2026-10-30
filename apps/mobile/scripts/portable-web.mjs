// Makes the web export work from any folder (a sub-path host or a static file share), not only from "/".
// Asset and chunk URLs become relative to a <base> fixed at load time; the router then sees "/" as its start.
// "_expo" becomes "app" because some static hosts reserve names that start with "_".
import { cp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [src = 'dist', out = 'dist-portable'] = process.argv.slice(2);
await rm(out, { recursive: true, force: true });
await cp(src, out, { recursive: true });
await rename(join(out, '_expo'), join(out, 'app'));

const js = join(out, 'app/static/js/web');
for (const f of await readdir(js)) {
  const p = join(js, f);
  const code = await readFile(p, 'utf8');
  await writeFile(p, code.replaceAll('"/_expo/', '"app/').replaceAll('"/assets/', '"assets/'));
}

const html = await readFile(join(src, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="\/([^"]+)" defer><\/script>/g)].map((m) => `<script src="${m[1].replace(/^_expo\//, 'app/')}" defer></script>`).join('\n');
const style = /<style id="expo-reset">[\s\S]*?<\/style>/.exec(html)[0];
// On a wide screen the app sits in a phone-sized frame (390 x 844), so the spacing reads as it would on a phone.
// The transform makes the frame the containing block for fixed-position layers (modals, overlays).
const frame = `<style id="phone-frame">
  @media (min-width: 560px) and (min-height: 640px) {
    body { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: #161616; }
    #root { flex: none; width: 390px; height: min(844px, calc(100vh - 64px)); overflow: hidden; transform: translateZ(0);
      background: #000000; border: 10px solid #050505; border-radius: 44px; box-shadow: 0 0 0 1px #333333, 0 24px 60px rgba(0, 0, 0, 0.6); }
    body::after { content: '390 \\0000D7  844 \\0000B7  tama\\0000F1o de tel\\0000E9fono'; font: 12px/1 system-ui, sans-serif; letter-spacing: 0.04em; color: #8a8a8a; }
  }
</style>`;
const boot = `<script>
  // Pin relative URLs to the folder this page was served from, then start the router at "/".
  (function () {
    var base = document.createElement('base');
    base.href = location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
    document.head.appendChild(base);
    try { history.replaceState(null, '', '/'); } catch (e) {}
  })();
</script>`;
// A fragment, not a full document: hosts that wrap pages in their own skeleton get valid HTML either way.
await writeFile(join(out, 'index.html'), `<title>E-Day Companion</title>
<meta name="description" content="Concepto no oficial con datos simulados.">
${style.replace('<style id="expo-reset">', '<style id="expo-reset">\n      :root { color-scheme: dark; }\n      body { background: #000000; }')}
${frame}
${boot}
<noscript>Necesitas JavaScript para usar esta demo.</noscript>
<div id="root"></div>
${scripts}
`);
console.log(`Portable web build in ${out}`);
