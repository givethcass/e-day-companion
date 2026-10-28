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
${style.replace('<style id="expo-reset">', '<style id="expo-reset">\n      :root { color-scheme: dark; }\n      body { background: #111315; }')}
${boot}
<noscript>Necesitas JavaScript para usar esta demo.</noscript>
<div id="root"></div>
${scripts}
`);
console.log(`Portable web build in ${out}`);
