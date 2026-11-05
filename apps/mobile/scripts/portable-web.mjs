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
// On a wide screen the app sits in a phone-sized frame, so the spacing reads as it would on a phone. A switch
// under the frame picks the phone (?device=max opens on the wide one); when the window is too short the frame is
// scaled down whole, so proportions stay true. The transform also makes the frame the containing block for
// fixed-position layers (modals, overlays). Narrow screens get the app full screen, with no frame and no switch.
const frame = `<style id="phone-frame">
  #device-bar { display: none; }
  @media (min-width: 560px) and (min-height: 640px) {
    body { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; background: #161616; }
    #root { flex: none; width: var(--w, 390px); height: var(--h, 844px); overflow: hidden; transform: scale(var(--s, 1)); transform-origin: top center;
      margin-bottom: var(--pull, 0px); background: #000000; border: 10px solid #050505; border-radius: 48px;
      box-shadow: 0 0 0 1px #333333, 0 24px 60px rgba(0, 0, 0, 0.6); }
    #device-bar { display: flex; align-items: center; gap: 6px; font: 12px/1 system-ui, sans-serif; letter-spacing: 0.04em; color: #8a8a8a; }
    #device-bar button { font: inherit; letter-spacing: inherit; color: #b5b5b5; background: transparent; border: 1px solid #3a3a3a; padding: 7px 10px; cursor: pointer; }
    #device-bar button[aria-pressed="true"] { color: #ffffff; background: #BF0A0A; border-color: #BF0A0A; }
    #device-bar span { margin-left: 6px; }
  }
</style>`;
const devices = `<div id="device-bar" role="group" aria-label="Tama&ntilde;o de tel&eacute;fono">
  <button type="button" data-device="std">iPhone 14</button>
  <button type="button" data-device="max">iPhone 17 Pro Max</button>
  <span id="device-size"></span>
</div>
<script>
  (function () {
    var DEVICES = { std: [390, 844], max: [440, 956] };
    var BORDER = 20, ROOM = 70;
    var pick = (/[?&]device=(std|max)/.exec(location.search) || [])[1];
    try { pick = pick || localStorage.getItem('eday-device'); } catch (e) {}
    if (!DEVICES[pick]) pick = 'std';
    var css = document.documentElement.style;
    function apply() {
      var d = DEVICES[pick], full = d[1] + BORDER;
      var s = Math.min(1, (window.innerHeight - ROOM) / full);
      css.setProperty('--w', d[0] + 'px');
      css.setProperty('--h', d[1] + 'px');
      css.setProperty('--s', String(s));
      css.setProperty('--pull', (s - 1) * full + 'px');
      document.getElementById('device-size').textContent = d[0] + ' \\u00d7 ' + d[1] + (s < 1 ? ' \\u00b7 al ' + Math.round(s * 100) + '%' : '');
      var buttons = document.querySelectorAll('#device-bar button');
      for (var i = 0; i < buttons.length; i++) buttons[i].setAttribute('aria-pressed', String(buttons[i].getAttribute('data-device') === pick));
    }
    document.getElementById('device-bar').addEventListener('click', function (e) {
      var key = e.target && e.target.getAttribute && e.target.getAttribute('data-device');
      if (!DEVICES[key]) return;
      pick = key;
      try { localStorage.setItem('eday-device', key); } catch (err) {}
      apply();
    });
    window.addEventListener('resize', apply);
    apply();
  })();
</script>`;
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
${devices}
${scripts}
`);
console.log(`Portable web build in ${out}`);
