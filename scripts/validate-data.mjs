// Run: npm run validate   (no dependencies, Node 18+)
// Checks the data files before you commit a weekly price update.
import { readFileSync, existsSync } from 'node:fs';
const j = f => JSON.parse(readFileSync(new URL('../' + f, import.meta.url), 'utf8'));
const ing = j('data/ingredients.json'), pr = j('data/prices.json'), dishes = j('data/dishes.json'), str = j('data/strings.json');
const errs = [], warn = [], ids = new Set(ing.map(i => i.id));
if (!/^\d{2}-\d{2}-\d{4}$/.test(pr.updated || '')) errs.push('prices.json: "updated" must look like 26-10-2026');
for (const i of ing) {
  const p = pr.prices[i.id];
  if (!p) { errs.push(`prices.json: missing price for "${i.id}"`); continue; }
  for (const f of ['pack', 'qc', 'kirana']) if (!(typeof p[f] === 'number' && p[f] > 0)) errs.push(`prices.json: ${i.id}.${f} must be a number above 0`);
  if (!['g', 'ml', 'pc'].includes(i.unit)) errs.push(`ingredients.json: ${i.id} unit must be g, ml or pc`);
  if (!p.qcChecked) warn.push(`${i.id}: quick-commerce price is an estimate`);
  if (!p.kiranaChecked) warn.push(`${i.id}: kirana price is an estimate`);
}
for (const k of Object.keys(pr.prices)) if (!ids.has(k)) errs.push(`prices.json: "${k}" is not in ingredients.json`);
for (const d of dishes) {
  if (!existsSync(new URL('../' + d.image, import.meta.url))) errs.push(`dishes.json: image missing for ${d.id} (${d.image})`);
  for (const x of d.items) if (!ids.has(x.id)) errs.push(`dishes.json: ${d.id} uses unknown ingredient "${x.id}"`);
  if (!d.items.some(x => !x.optional)) errs.push(`dishes.json: ${d.id} has no must-have ingredient`);
}
for (const k of ['top', 'h1', 'find', 'fin']) if (!str[k]) errs.push(`strings.json: missing "${k}"`);
console.log(`${ing.length} ingredients, ${dishes.length} dishes, prices dated ${pr.updated}`);
if (warn.length) console.log(`\n${warn.length} estimated prices (qcChecked/kiranaChecked = false):\n  ` + warn.join('\n  '));
if (errs.length) { console.error('\nERRORS:\n  ' + errs.join('\n  ')); process.exit(1); }
console.log('\nData OK.');
