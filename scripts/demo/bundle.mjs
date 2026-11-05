// Puts the three demos behind one device switcher, ready to publish as a single page:
//   index.html   the switcher (scripts/demo/shell.html)
//   mobile.html  the Expo web export (phone and tablet), plus its app/ and assets/ folders
//   web.html     the desktop site from apps/web, plus its web/ folder
// Run after `npm run export:web -w @eday/mobile` and `npm run build -w @eday/web`.
import { cp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const out = join(root, process.argv[2] ?? 'dist-demo');
const mobile = join(root, 'apps/mobile/dist-portable');
const web = join(root, 'apps/web/dist');

await rm(out, { recursive: true, force: true });
for (const f of await readdir(mobile)) if (f !== 'index.html') await cp(join(mobile, f), join(out, f), { recursive: true });
await cp(join(web, 'web'), join(out, 'web'), { recursive: true });

// Pages loaded in an iframe need a full document of their own.
const doc = (head, body) => `<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
const frag = await readFile(join(mobile, 'index.html'), 'utf8');
const split = frag.indexOf('<noscript>');
await writeFile(join(out, 'mobile.html'), doc(frag.slice(0, split).trim(), frag.slice(split).trim()));
await cp(join(web, 'index.html'), join(out, 'web.html'));
await cp(join(root, 'scripts/demo/shell.html'), join(out, 'index.html'));
console.log(`Demo bundle in ${out}`);
