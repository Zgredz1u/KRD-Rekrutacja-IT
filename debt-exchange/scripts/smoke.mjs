/**
 * Smoke test: loads the production bundle (dist/) into jsdom and verifies
 * that the app boots, fetches TOP 10 debts from the live API, renders the
 * table, and that sorting + search work end-to-end.
 *
 * Run: node scripts/smoke.mjs
 */
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const assetMatch = html.match(/src="\.\/(assets\/[^"]+\.js)"/);
if (!assetMatch) {
  console.error('FAIL: could not find bundle script in dist/index.html');
  process.exit(1);
}
const js = readFileSync(new URL(`../dist/${assetMatch[1]}`, import.meta.url), 'utf8');

const dom = new JSDOM(html, {
  url: 'https://rekrutacja-webhosting-it.krd.pl/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
});

const { window } = dom;

// Polyfills the bundle expects from a browser environment.
window.fetch = (input, init) => fetch(input, init);
window.AbortController = AbortController;
window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
window.cancelAnimationFrame = (id) => clearTimeout(id);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`ok - ${msg}`);
}

const bodyRows = () => window.document.querySelectorAll('.table__body .table__row');

// Execute the bundle.
window.eval(js);

// Wait for the initial TOP 10 load (API has a small random delay).
let rows = [];
for (let i = 0; i < 60; i++) {
  await sleep(500);
  rows = bodyRows();
  if (rows.length > 0) break;
}

assert(rows.length === 10, `TOP 10 rows rendered (got ${rows.length})`);

const headers = [...window.document.querySelectorAll('.table__header-cell')]
  .map((el) => el.textContent.trim().replace(/[▲▼]/g, '').trim());
assert(
  JSON.stringify(headers) ===
    JSON.stringify(['DŁUŻNIK', 'NIP', 'KWOTA ZADŁUŻENIA', 'DATA POWSTANIA ZOBOWIĄZANIA']),
  `table headers correct: ${headers.join(' | ')}`
);

// Default sort: Name ascending.
const names = [...rows].map((r) => r.querySelector('.table__cell').textContent.trim());
const sorted = [...names].sort((a, b) => a.localeCompare(b, 'pl'));
assert(JSON.stringify(names) === JSON.stringify(sorted), 'default sort is Name ascending');

// Date format dd-mm-yyyy.
const dateCell = rows[0].querySelectorAll('.table__cell')[3].textContent.trim();
assert(/^\d{2}-\d{2}-\d{4}$/.test(dateCell), `date formatted dd-mm-yyyy (got "${dateCell}")`);

// Sort by Value descending: click the KWOTA ZADŁUŻENIA sort button twice (asc -> desc).
const valueSortButton = window.document
  .querySelectorAll('.table__header-cell')[2]
  .querySelector('.table__sort');
valueSortButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await sleep(300);
valueSortButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await sleep(300);

const values = [...bodyRows()]
  .map((r) => Number(r.querySelectorAll('.table__cell')[2].textContent.replace(/\s/g, '').replace(',', '.')));
const desc = [...values].sort((a, b) => b - a);
assert(JSON.stringify(values) === JSON.stringify(desc), 'Value descending sort works');

// Search: type a phrase and submit the form.
const input = window.document.querySelector('.search__input');
const form = window.document.querySelector('.search');
const setNativeValue = (el, value) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(el, value);
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
};

// Capture the current (value-descending) first row so we can detect the
// re-render once the search result replaces the 10-row list.
const preSearchFirst = bodyRows()[0]?.textContent;

setNativeValue(input, 'Szulc');
form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

let searchRows = [];
for (let i = 0; i < 60; i++) {
  await sleep(500);
  searchRows = bodyRows();
  // The table is re-rendered once the search result arrives.
  if (searchRows.length !== 10 || searchRows[0]?.textContent !== preSearchFirst) break;
}
assert(searchRows.length === 1, `search for "Szulc" returned exactly 1 row (got ${searchRows.length})`);
assert(
  searchRows[0]?.textContent.includes('Szulc'),
  `search result row is the Szulc debtor (got "${searchRows[0]?.textContent}")`
);

console.log('\nSMOKE TEST PASSED');
process.exit(0);
