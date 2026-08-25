// Render the REAL built bundle in jsdom against the LIVE local APIs.
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const html = readFileSync('./dist/index.html','utf8');
const js = readFileSync('./dist/' + html.match(/src="\/([^"]+\.js)"/)[1],'utf8');
const dom = new JSDOM(html, { runScripts:'outside-only', url:'http://localhost:4207/', pretendToBeVisual:true });
dom.window.fetch = (...a) => fetch(...a);   // real network to localhost:8420
dom.window.eval(js);
await new Promise(r=>setTimeout(r,2500));
const d = dom.window.document;
const q = s => [...d.querySelectorAll(s)];
console.log('title       :', d.title);
console.log('cards       :', q('.card').length);
console.log('tiers       :', q('.tier').length, '|', [...new Set(q('.tier').map(e=>e.textContent))].join(', '));
console.log('refusal(s)  :', q('.refusal').length);
q('.refusal').forEach(e=>console.log('   -', e.textContent.trim().slice(0,100)));
console.log('legal paras :', q('.legal p').length);
console.log('sections    :', q('h2').map(e=>e.textContent).join(' | '));
console.log('errors shown:', q('.error').length);
