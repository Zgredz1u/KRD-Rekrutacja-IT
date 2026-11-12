/**
 * Debug helper: loads the production bundle into jsdom and dumps
 * the resulting DOM + any console/exception output.
 */
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const assetMatch = html.match(/src="\.\/(assets\/[^"]+\.js)"/);
const js = readFileSync(new URL(`../dist/${assetMatch[1]}`, import.meta.url), 'utf8');

const dom = new JSDOM(html, {
  url: 'https://rekrutacja-webhosting-it.krd.pl/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  virtualConsole: new VirtualConsole(),
});

const { window } = dom;

const vc = dom.virtualConsole;
vc.on('jsdomError', (e) => console.log('JSDOM ERROR:', e.message, e.detail?.stack || ''));
vc.on('error', (...a) => console.log('CONSOLE ERROR:', ...a));
vc.on('log', (...a) => console.log('CONSOLE LOG:', ...a));

window.fetch = (input, init) =>
  fetch(input, init).then(
    (res) => {
      console.log('FETCH OK:', typeof input === 'string' ? input : input.url, res.status);
      return res;
    },
    (err) => {
      console.log('FETCH FAIL:', typeof input === 'string' ? input : input.url, err.message);
      throw err;
    }
  );
window.AbortController = AbortController;
window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
window.cancelAnimationFrame = (id) => clearTimeout(id);

window.addEventListener('error', (e) => console.log('WINDOW ERROR:', e.message));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  window.eval(js);
  console.log('bundle evaluated OK');
} catch (e) {
  console.log('BUNDLE EVAL THREW:', e.message);
  console.log(e.stack);
}

await sleep(5000);
console.log('--- DOM after 5s ---');
console.log(window.document.body.innerHTML.slice(0, 3000));
process.exit(0);
