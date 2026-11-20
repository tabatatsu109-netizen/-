// Usage: node render.mjs <outDir> <w> <h> <fps> <frameStart> <frameEnd> [step] [cam]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const [out, w, h, fps, f0, f1, step = '1', camMode = ''] = process.argv.slice(2);
const root = path.dirname(new URL(import.meta.url).pathname);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); r.end(d); } }); });
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
page.on('console', m => console.log('[page]', m.text())); page.on('pageerror', e => console.log('[error]', e.message));
await page.goto(`http://localhost:${port}/index.html?w=${w}&h=${h}${camMode ? '&cam=' + camMode : ''}`);
await page.waitForFunction('window.ready===true', null, { timeout: 120000 });
if (+f0 === 0 || step !== '1') console.log(JSON.stringify(await page.evaluate('window.info')));
const t0 = Date.now();
for (let f = +f0; f < +f1; f += +step) {
  const url = await page.evaluate(([t]) => { window.renderAt(t); return document.querySelector('canvas').toDataURL('image/png'); }, [f / +fps]);
  fs.writeFileSync(path.join(out, `f${String(f).padStart(5, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
}
console.log(`frames ${f0}-${f1} done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
await browser.close(); srv.close();
