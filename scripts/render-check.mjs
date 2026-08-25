// Render the REAL built bundle in jsdom and assert what actually appears.
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const html = readFileSync('./dist/index.html','utf8');
const js = readFileSync('./dist/' + html.match(/src="\/([^"]+\.js)"/)[1],'utf8');
const dom = new JSDOM(html, { runScripts:'outside-only', url:'http://localhost:4207/', pretendToBeVisual:true });
dom.window.fetch = async () => { throw new Error('offline'); };
dom.window.eval(js);
await new Promise(r=>setTimeout(r,1200));
const d = dom.window.document;
const q = s => [...d.querySelectorAll(s)];
console.log('title       :', d.title);
console.log('h1          :', d.querySelector('h1')?.textContent);
console.log('cards       :', q('.card').length);
console.log('tiers       :', q('.tier').map(e=>e.textContent).join(' | '));
console.log('FL tags     :', q('.tag').length);
console.log('refusal     :', q('.refusal')[0]?.textContent.trim().slice(0,90) ?? 'NONE');
console.log('legal paras :', q('.legal p').length);
console.log('api error   :', q('.error')[0] ? 'shown (expected: API not deployed)' : 'none');
