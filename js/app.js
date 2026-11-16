/* Kya Banana Hai. Plain JavaScript, no build step.
   Data lives in /data/*.json (prices.json is the weekly-edit file). */
'use strict';

let I = {}, D = [], HH = {}, SX = {}, CR = {}, GP = {}, U = {}, STP = [], VD = [], IMG = {}, PD = '';
const HU = { pc: ['pc', 'नग'], tsp: ['tsp', 'छोटा चम्मच'], tbsp: ['tbsp', 'बड़ा चम्मच'], katori: ['katori (bowl)', 'कटोरी'] };
let S = { s: 0, n: '', l: 'en', mu: 0, m: {}, dy: {}, nd: {}, ms: {}, us: {}, hm: {}, pt: {}, lg: [], pq: 0, qc: 1, sheet: 0, msg: '', mo: 0, ed: {}, pf: 0, cx: {} };
try { Object.assign(S, JSON.parse(localStorage.getItem('p2c'))); } catch (e) {}

/* ---------- helpers ---------- */
const DAY = 864e5;
const hi = () => S.l == 'hi';
const t = k => U[k][hi() ? 1 : 0];
const nm = o => o.length > 6 && o[0] != o[1] ? o[hi() ? 1 : 0] + ' · ' + o[hi() ? 0 : 1] : o[hi() ? 1 : 0];
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[<>&"]/g, '');
const dd = id => D.find(d => d.id == id);
const tm = () => Object.values(S.m).reduce((a, b) => a + b, 0);

/* quantity formatting */
const fq = (k, q) => {
  q = Math.round(q * 10) / 10; const u = I[k][3];
  return u == 'pc' ? q + (hi() ? ' नग' : ' pc')
    : q >= 1000 ? q / 1000 + (u == 'g' ? (hi() ? ' किग्रा' : ' kg') : ' L')
    : q + (u == 'g' ? (hi() ? ' ग्रा' : ' g') : (hi() ? ' मिली' : ' ml'));
};
const fr = n => { const r = Math.round(n * 2) / 2; if (r < .5) return '½'; return (Math.floor(r) || '') + (r % 1 ? '½' : ''); };
/* household measure first, grams second: [primary, secondary] */
const hz = (k, q) => { const h = HH[k]; return h && q > 0 ? [`≈ ${fr(q / h[0])} ${HU[h[1]][hi() ? 1 : 0]}`, fq(k, q)] : [fq(k, q), '']; };
const fh = (k, q) => { const h = HH[k]; return h && q > 0 ? `≈ ${fr(q / h[0])} ${HU[h[1]][hi() ? 1 : 0]} (${fq(k, q)})` : fq(k, q); };
const st = k => I[k][3] == 'pc' ? 1 : I[k][4] >= 250 ? 50 : I[k][4] >= 50 ? 10 : 5;
const ss = k => { const b = HH[k] ? HH[k][0] / 2 : st(k); return I[k][3] == 'pc' && !HH[k] ? 1 : Math.min(b, S.nd[k] / 2); };

/* money and list maths */
const P = k => S.qc ? I[k][5] : I[k][6];
const items = () => Object.keys(S.nd).filter(k => !S.mo || S.ms[k]);
const bu = k => Math.max(0, S.nd[k] - (S.hm[k] || 0));            /* still to buy */
const pk = k => Math.ceil(bu(k) / I[k][4]);                        /* packs to buy */
const buyList = () => items().filter(k => bu(k) > 0);
const total = q => buyList().reduce((a, k) => a + pk(k) * I[k][q ? 5 : 6], 0);
const full = () => items().reduce((a, k) => a + Math.ceil(S.nd[k] / I[k][4]) * P(k), 0);
const mc = () => buyList().reduce((a, k) => a + bu(k) * P(k) / I[k][4], 0);
const pv = () => Math.round(mc() / Math.max(1, tm()));            /* cost per serve for this cart */
const LNK = k => { const q = encodeURIComponent(I[k][0]); return S.qc ? `https://www.zeptonow.com/search?query=${q}` : `https://blinkit.com/s/?q=${q}`; };
const pq = k => P(k) ? '₹' + pk(k) * P(k) : '—';
/* plate cost on screens 1 and 2: must-haves only, staples at home, Zepto price */
const dc = id => Math.round(dd(id).items.reduce((a, x) => x.optional || STP.includes(x.id) ? a : a + x.qty * I[x.id][5] / I[x.id][4], 0));

const sx = k => SX[k] ? `<div class=nt>${SX[k][hi() ? 1 : 0]}</div>` : '';
const est2 = () => (PD ? t('upd').replace('{d}', PD) : t('estp')) + ' ' + t('est2');

/* ---------- render shell ---------- */
function R() {
  try { localStorage.setItem('p2c', JSON.stringify(S)); } catch (e) {}
  const hd = `<div class=hd><span></span><span><button onclick="LG()">${hi() ? 'EN' : 'हिं'}</button> <button onclick="SP()" aria-label="Hindi audio">${t('lis')}</button></span></div>`
    + (S.s > 0 && S.s < 5 ? `<button class=lk onclick="G(${S.s - 1})">← ${t('bk')}</button>` : '');
  $('app').innerHTML = hd + [W, M, GR, HM, FN][S.s]();
}
const G = n => { S.s = n; S.sheet = 0; scrollTo(0, 0); R(); };
const LG = () => { S.l = hi() ? 'en' : 'hi'; R(); };

/* ---------- screen 1: welcome ---------- */
const vc = () => `<div class=nt style="margin:16px 0 6px;font-style:normal;font-weight:600;letter-spacing:.06em;text-transform:uppercase">${t('vh')}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${VD.map(id => `<div style="background:var(--cd);border:1px solid var(--br);border-radius:14px;overflow:hidden"><img src="${IMG[id] || ''}" alt="" style="width:100%;aspect-ratio:1;object-fit:cover;display:block"><div style="padding:6px 8px 9px"><div style="font:800 26px/1 'Bricolage Grotesque',sans-serif;color:var(--pr)">₹${dc(id)}</div><div class=nt style="margin-top:3px">${nm(dd(id).n)}</div></div></div>`).join('')}</div><div class=nt style="margin:6px 0 4px">${t('vf')}</div>`;
function W() {
  return `<div class=nt style="letter-spacing:.1em;text-transform:uppercase;font-style:normal;font-family:inherit;font-weight:600;margin-top:8px">${t('top')}</div><h1 style="margin-top:2px">${t('h1')}</h1><p>${t('tag')}</p>${vc()}<label for=nin class=nt style="display:block;margin-top:16px;font-style:normal;font-weight:600;font-size:14px;color:var(--fg)">${t('ns')}</label><input type=text id=nin placeholder="${t('nm')}" value="${esc(S.n)}" oninput="S.n=this.value;$('c').disabled=!this.value.trim()" onkeydown="if(event.key=='Enter'&&S.n.trim())G(1)"><button class=lk onclick="S.n='Demo User';G(1)">${t('dm')}</button><button id=c class=pb ${S.n.trim() ? '' : 'disabled'} onclick="G(1)">${t('go')}</button>`;
}

/* ---------- screen 2: choose meals ---------- */
function MU(v) { S.mu = v; if (!v) { const f = Object.keys(S.m)[0]; S.m = f ? { [f]: 1 } : {}; } R(); }
function PK(id) { if (!S.mu) S.m = { [id]: 1 }; else if (tm() < 6) S.m[id] = (S.m[id] || 0) + 1; R(); }
function CH(id, d) { const v = (S.m[id] || 0) + d; if (d > 0 && tm() >= 6) return; v <= 0 ? delete S.m[id] : S.m[id] = v; R(); }
function DY(id) { S.dy[id] = S.dy[id] == 2 ? 1 : 2; R(); }
const lpTxt = () => Object.keys(S.lp.m).filter(i => dd(i)).map(i => nm(dd(i).n) + ' ×' + S.lp.m[i]).join(', ');
const lpCard = () => S.lp && !tm() && lpTxt() ? `<div class=pn style="display:flex;gap:8px;align-items:center;justify-content:space-between"><span><b>${t('lp')}</b><div class=nt>${lpTxt()}</div></span><button onclick="UL()">${t('lpu')}</button></div>` : '';
function UL() { S.mu = S.lp.mu; S.m = { ...S.lp.m }; S.dy = { ...S.lp.dy }; R(); }
function M() {
  const ids = Object.keys(S.m);
  return `<h2>${t('hi')}, ${esc(S.n)}</h2>${lpCard()}<div class=tg><button class="pill ${S.mu ? '' : 'on'}" onclick="MU(0)">${t('one')}</button><button class="pill ${S.mu ? 'on' : ''}" onclick="MU(1)">${t('mul')}</button></div>${S.mu ? `<div class=nt>${tm()} / 6 ${t('of')}</div>` : ''}<div class=gd>${D.map(d => {
    const c = S.m[d.id] || 0;
    return `<div class="dc ${c ? 'sel' : ''}" onclick="PK('${d.id}')"><div class=em>${IMG[d.id] ? `<img src="${IMG[d.id]}" alt="${nm(d.n)}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;display:block">` : ''}</div><b>${nm(d.n)}</b><div class=nt>${d.m} ${t('min')} · ≈₹${dc(d.id)}/${t('srv')}</div><div class=nt>${t(d.w ? 'hv' : 'lt')} · ${d.t.split('').map(x => t(x)).join(' / ')}</div>${S.mu && c ? `<div class=ct onclick="event.stopPropagation()"><button onclick="CH('${d.id}',-1)">−</button><b>${c}</b><button onclick="CH('${d.id}',1)">+</button><button onclick="DY('${d.id}')">${t('d')} ${S.dy[d.id] || 1}</button></div>` : ''}${c ? `<div class=pn style="text-align:left;margin:8px 0 0;font-size:12.5px;line-height:1.35" onclick="event.stopPropagation()"><b>${t('prp')}</b> ${nm(d.p)}${d.k[0] ? `<br><b>${t('eqp')}</b> ${nm(d.k)}` : ''}</div>` : ''}</div>`;
  }).join('')}</div><button class=pb ${ids.length ? '' : 'disabled'} onclick="FIND()">${t('find')}</button>`;
}

/* ---------- screen 3: grocery list ---------- */
function FIND() {
  S.nd = {}; S.ms = {}; S.us = {}; S.hm = {}; S.mo = 0; S.ed = {}; S.pf = 0;
  for (const id in S.m) dd(id).items.forEach(x => {
    S.nd[x.id] = (S.nd[x.id] || 0) + x.qty * S.m[id];
    if (!x.optional) S.ms[x.id] = 1;
    (S.us[x.id] = S.us[x.id] || []).push(id);
  });
  for (const k in S.nd) S.nd[k] = Math.ceil(S.nd[k]);
  STP.forEach(k => { if (S.nd[k]) { S.hm[k] = S.nd[k]; S.pf = 1; } });   /* pre-tick kitchen staples */
  S.pq = 0; S.psv = 0; S.pt = S.pt || {};
  for (const k in S.nd) {                                                /* pre-tick what the last shop left over */
    const e = S.pt[k]; if (!e || STP.includes(k)) continue;
    if (GP[k] != 'cabinet' && Date.now() - e[1] > 3 * DAY) continue;     /* fresh items are forgotten after 3 days */
    const h = Math.min(S.nd[k], e[0]); if (h > 0) { S.hm[k] = h; S.pq++; }
  }
  S.lg = (S.lg || []).concat(Date.now()).slice(-60);                       /* local plan log, never sent anywhere */
  G(2);
}
function AD() { const k = $('ad').value; if (k) { S.nd[k] = I[k][4]; S.ms[k] = 1; R(); } }
function AC() {
  const n = $('cn').value.trim(), q = +$('cq').value;
  if (!n || q <= 0) { (!n ? $('cn') : $('cq')).style.outline = '2px solid red'; return; }
  const u = $('cu').value, p = +$('cp').value || 0, id = 'x' + Date.now(), e = [n, n, '', u, q, p, p];
  S.cx[id] = e; I[id] = e; S.nd[id] = q; S.ms[id] = 1; R();
}
const tgl = () => `<label class=rw style="cursor:pointer"><input type=checkbox ${S.mo ? 'checked' : ''} onchange="S.mo=this.checked;R()" style="width:22px;height:22px;flex:none"><span><b>${t('mo')}</b><div class=nt>${t('mo2')}</div></span></label>`;
/* caution + quick fix, shown only for ingredients that have one */
const cw = k => CR[k] ? `<details class=cw><summary>${t('care')}</summary><div>${CR[k][hi() ? 1 : 0]}</div><div class=fx><b>${t('fixl')}:</b> ${CR[k][hi() ? 3 : 2]}</div></details>` : '';
function GR() {
  const ks = items().sort((a, b) => (S.ms[b] ? 1 : 0) - (S.ms[a] ? 1 : 0)), rest = Object.keys(I).filter(k => !S.nd[k]);
  return `<h2>${t('gro')}</h2>${tgl()}${ks.map(k => `<div class=rw><div class=fl><b>${nm(I[k])}</b><div><span class="tag ${S.ms[k] ? 'mu' : 'gd2'}">${t(S.ms[k] ? 'must' : 'good')}</span>${(S.us[k] || []).length > 1 ? ` <span class=nt>${t('used')} ${S.us[k].length}</span>` : ''}</div>${sx(k)}${cw(k)}</div><div style="text-align:right"><div>${hz(k, S.nd[k])[0]}</div><div class=nt>${hz(k, S.nd[k])[1]}</div></div></div>`).join('')}${rest.length ? `<div class=rw><select id=ad style="flex:1;font:inherit;padding:8px">${rest.map(k => `<option value=${k}>${nm(I[k])}</option>`).join('')}</select><button onclick="AD()">+ ${t('pick')}</button></div>` : ''}<div class=rw style="flex-wrap:wrap;gap:6px"><div class=nt style="width:100%">${t('own')}</div><input type=text id=cn placeholder="${t('iname')}" style="width:100%;margin:0;padding:10px"><input type=number id=cq min=1 placeholder="${t('qty')}" class=ni><select id=cu class=ni><option>g<option>ml<option>pc</select><input type=number id=cp min=0 placeholder="${t('pri')}" class=ni style="width:110px"><button onclick="AC()">+ ${t('add')}</button></div><button class=pb onclick="G(3)">${t('adj')}</button>`;
}

/* ---------- screen 4: what is at home ---------- */
function HC(k, c) { S.hm[k] = c ? S.nd[k] : 0; R(); }
function ED(k) { S.ed = S.ed || {}; S.ed[k] = !S.ed[k]; R(); }
function HS(k, d) { S.hm[k] = Math.min(S.nd[k], Math.max(0, Math.round(((S.hm[k] || 0) + d * ss(k)) * 10) / 10)); R(); }
function HM() {
  const ks = items().sort((a, b) => (bu(a) == 0) - (bu(b) == 0)); S.ed = S.ed || {};
  const row = (k, cb) => {
    const q = hz(k, S.nd[k]), e = S.ed[k], h = S.hm[k] || 0, hq = hz(k, h), sz = cb ? 18 : 22;
    return `<div class="rw ${bu(k) ? '' : 'off'} ${cb ? 'cb' : ''}"><input type=checkbox id=c_${k} ${bu(k) == 0 ? 'checked' : ''} onchange="HC('${k}',this.checked)" style="width:${sz}px;height:${sz}px;flex:none"><div class=fl><label for=c_${k} style="cursor:pointer;display:block"><b>${nm(I[k])}</b>${sx(k)}${!e && h > 0 && bu(k) > 0 ? `<div class=nt>${t('ah')}: ${hq[0]}</div>` : ''}</label>${cw(k)}</div>${e ? `<div style="text-align:right"><div class=nt>${t('need')}: ${q[0]}</div><div class=ct style="margin:4px 0;justify-content:flex-end"><button onclick="HS('${k}',-1)">−</button><span style="min-width:70px;text-align:center">${hq[0]}</span><button onclick="HS('${k}',1)">+</button></div><button class=lk onclick="ED('${k}')">${t('dn')}</button></div>` : `<div style="text-align:right"><div>${q[0]}</div><div class=nt>${q[1]}</div><button class=lk style="font-size:13px" onclick="ED('${k}')">${t('ed')}</button></div>`}</div>`;
  };
  const fz = ks.filter(k => GP[k] != 'cabinet'), cb = ks.filter(k => GP[k] == 'cabinet');
  return `<h2>${t('home')}</h2>${S.pf ? `<div class=pn>${t('pre')}</div>` : ''}${S.pq ? `<div class=pn>${t('pnb').replace('{n}', S.pq)}</div>` : ''}${fz.length ? `<h3 class=sec>${t('fresh')}</h3>${fz.map(k => row(k, 0)).join('')}` : ''}${cb.length ? `<h3 class="sec cab">${t('cab')}</h3><div class=nt>${t('cabn')}</div><div class=cabs>${cb.map(k => row(k, 1)).join('')}</div>` : ''}<div class=st style="position:static;margin:12px 0">${t('nb')}: ${buyList().length} / ${ks.length}</div><button class=pb onclick="G(4)">${t('fin')}</button>`;
}

/* ---------- screen 5: shopping list ---------- */
const chips = () => `<div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 4px">${Object.keys(S.m).map(i => { const d = dd(i); return `<span style="display:inline-flex;align-items:center;gap:6px;background:var(--cd);border:1px solid var(--br);border-radius:999px;padding:3px 12px 3px 3px;font-size:14px">${IMG[i] ? `<img src="${IMG[i]}" alt="" style="width:30px;height:30px;border-radius:50%;object-fit:cover">` : ''}<b>${nm(d.n)}</b><span style="color:var(--pr);font-weight:700">×${S.m[i]}</span>${S.mu ? `<span class=nt>${t('d')} ${S.dy[i] || 1}</span>` : ''}</span>`; }).join('')}</div>`;
const ol = () => { const b = buyList().length; if (!b) return ''; const p = total(S.qc), v = pv(); return `<div style="font:700 17px/1.35 'Bricolage Grotesque',system-ui,sans-serif;margin:6px 0 10px">${hi() ? `${b} चीज़ें ख़रीदें · ₹${p} · लगभग ₹${v} प्रति थाली` : `Buy ${b} item${b > 1 ? 's' : ''} · ₹${p} · about ₹${v} a serve`}</div>`; };
function FN() {
  if (tm()) { S.lp = { m: { ...S.m }, dy: { ...S.dy }, mu: S.mu }; try { localStorage.setItem('p2c', JSON.stringify(S)); } catch (e) {} }
  const b = buyList();
  return `<div id=pr><h2>${t('lst')}</h2>${chips()}${ol()}${b.length ? b.map(k => `<div class=rw><div class=fl><b>${nm(I[k])}</b><div class=nt>${t('need')} ${fh(k, bu(k))} · ${t('buy')} ${pk(k)} × ${fq(k, I[k][4])}</div>${sx(k)}${I[k][7] ? `<div class=nt>${t('sub')}: ${nm(I[k].slice(7))}</div>` : ''}</div><div style="text-align:right"><b>${pq(k)}</b><div><a class=lk style="font-size:13px" href="${LNK(k)}" target=_blank rel=noopener>${t('opn').replace('{p}', t(S.qc ? 'qc' : 'ki'))} ↗</a></div></div></div>`).join('') : `<p>${t('em')}</p>`}<div class=tot><div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;opacity:.9;margin-bottom:6px">${t('cmp')}</div><div class=tg><button class="pill ${S.qc ? 'on' : ''}" onclick="S.qc=1;R()">${t('qc')}</button><button class="pill ${S.qc ? '' : 'on'}" onclick="S.qc=0;R()">${t('ki')}</button></div>${t('tot')}<div class=big>₹${total(S.qc)}</div><div class=sg><div><b>₹${pv()}</b><span>${t('ps')}</span></div><div><b>₹${full() - total(S.qc)}</b><span>${t('sv')}</span></div><div><b>₹${total(S.qc) - Math.round(mc())}</b><span>${t('lo')}</span></div></div><details style="margin-top:8px"><summary>${t('br')}</summary><table><tr><th></th><th>${t('buy')}</th><th>${t('qc')}</th><th>${t('ki')}</th></tr>${b.map(k => `<tr><td>${nm(I[k])}</td><td>${pk(k)} × ${fq(k, I[k][4])}</td><td>₹${pk(k) * I[k][5]}</td><td>₹${pk(k) * I[k][6]}</td></tr>`).join('')}<tr><td><b>${t('tot')}</b></td><td></td><td><b>₹${total(1)}</b></td><td><b>₹${total(0)}</b></td></tr></table></details></div><div class=nt>${est2()}</div></div><div class=pn style="margin-top:12px"><b>${t('ptt')}</b><div class=nt>${t('ptd')}</div>${S.psv ? `<div class=nt style="color:var(--pr);font-weight:700">${t('psd').replace('{n}', S.psv)}</div>` : ''}${S.psv ? '' : `<button class=pb style="margin-top:8px" onclick="PS()">${t('psv')}</button>`}${Object.keys(S.pt || {}).length ? `<button class=lk onclick="PC()">${t('pcl')}</button>` : ''}</div><button class=lk onclick="RS()">${t('pa')}</button><button class=pb onclick="S.sheet=1;R()">${t('sh')}</button>${S.sheet ? `<div class=sh onclick="S.sheet=0;R()"><div onclick="event.stopPropagation()"><button onclick="WA()">${t('wa')}</button><button onclick="CP()">${S.msg || t('cp')}</button><button onclick="PRT()">${S.pm || t('pr')}</button></div></div>` : ''}`;
}
function TX() { return `${t('lst')} (${Object.keys(S.m).map(i => nm(dd(i).n) + ' ×' + S.m[i]).join(', ')})\n` + buyList().map(k => `• ${nm(I[k])}: ${pk(k)} × ${fq(k, I[k][4])} = ₹${pk(k) * P(k)}`).join('\n') + `\n${t('tot')} (${t(S.qc ? 'qc' : 'ki')}): ₹${total(S.qc)}`; }
function CP() { try { navigator.clipboard.writeText(TX()); } catch (e) {} S.msg = t('ok'); R(); setTimeout(() => { S.msg = ''; R(); }, 1500); }
function WA() { window.open('https://wa.me/?text=' + encodeURIComponent(TX()), '_blank'); }
/* pantry memory: after a shop, leftovers of each bought pack are remembered for the next plan */
function PS() {
  S.pt = S.pt || {}; const now = Date.now();
  items().forEach(k => {
    const home = Math.max(0, ((S.pt[k] || [0])[0]) - (S.hm[k] || 0)), left = home + pk(k) * I[k][4] - bu(k);
    if (left > 0) S.pt[k] = [Math.round(left * 10) / 10, now]; else delete S.pt[k];
  });
  S.psv = Object.keys(S.pt).length; R();
}
function PC() { S.pt = {}; S.psv = 0; R(); }
/* local only: plans made, and plans started again within 7 days of the first */
function STATS() { const l = S.lg || []; return { plans: l.length, again7d: l.filter(x => x > l[0] && x - l[0] <= 7 * DAY).length }; }
function RS() { S.m = {}; S.nd = {}; S.hm = {}; S.us = {}; S.ms = {}; S.dy = {}; G(1); }
function PRT() {
  const b = buyList(), h = `<html><head><meta charset=utf-8><title>${t('lst')}</title><style>body{font:16px system-ui,sans-serif;padding:24px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #999;padding:6px;text-align:left}</style></head><body><h2>${t('lst')}</h2><p>${Object.keys(S.m).map(i => nm(dd(i).n) + ' ×' + S.m[i]).join(', ')}</p><table>${b.map(k => `<tr><td>${nm(I[k])}</td><td>${pk(k)} × ${fq(k, I[k][4])}</td><td>${pq(k)}</td></tr>`).join('')}<tr><th colspan=2>${t('tot')} (${t(S.qc ? 'qc' : 'ki')})</th><th>₹${total(S.qc)}</th></tr></table></body></html>`;
  let w = null; try { w = window.open('', '_blank'); } catch (e) {}
  if (w && w.document) { w.document.write(h); w.document.close(); setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 400); }
  else { try { print(); } catch (e) { S.pm = t('pf'); } R(); }
}

/* ---------- audio summaries ---------- */
function NR() {
  const H = k => I[k][1], jn = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' और ' + a[a.length - 1] : a[0] || '', ids = Object.keys(S.m), b = buyList();
  if (S.s == 0) return 'अपना नाम लिखिए और आगे बढ़िए।';
  if (S.s == 1) return ids.length ? `आपने ${tm()} भोजन चुने हैं: ${jn(ids.map(i => dd(i).n[1]))}। पहले से करने वाली तैयारी: ${jn(ids.map(i => dd(i).p[1]))}। तैयार हों तो किराना खोजें दबाइए।` : 'आठ पकवानों में से अपना भोजन चुनिए। चाहें तो अगले दो दिन के लिए छह भोजन तक चुन सकते हैं।';
  if (S.s == 2) { const m = items().filter(k => S.ms[k]); return `आपके भोजन के लिए कुल ${items().length} सामान चाहिए, जिनमें ${m.length} ज़रूरी हैं। मुख्य सामान हैं ${jn(m.slice(0, 5).map(H))}। आगे बढ़कर बताइए कि घर में क्या पहले से है।`; }
  if (S.s == 3) return `${items().length} में से अभी ${b.length} सामान ख़रीदने बाकी हैं। जो घर में है उस पर टिक लगाइए, या बदलें दबाकर कम मात्रा चुनिए।`;
  const sb = b.find(k => I[k][7]);
  return b.length ? `आपको ${b.length} चीज़ें ख़रीदनी हैं: ${jn(b.slice(0, 6).map(H))}${b.length > 6 ? ' वगैरह' : ''}। ज़ेप्टो पर कुल लगभग ${total(1)} रुपये लगेंगे, और ब्लिंकिट पर लगभग ${total(0)} रुपये। घर के सामान से आपने लगभग ${full() - total(S.qc)} रुपये बचाए। एक थाली का ख़र्च लगभग ${pv()} रुपये है।${sb ? ` और अगर ${H(sb)} न मिले, तो ${I[sb][8]} ले सकते हैं।` : ''}` : 'आपके पास सब कुछ घर में है। कुछ ख़रीदने की ज़रूरत नहीं।';
}
function NE() {
  const H = k => I[k][0], jn = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0] || '', ids = Object.keys(S.m), b = buyList();
  if (S.s == 0) return 'Enter your name and continue.';
  if (S.s == 1) return ids.length ? `You’ve picked ${tm()} meals: ${jn(ids.map(i => dd(i).n[0]))}. Prep to do ahead: ${jn(ids.map(i => dd(i).p[0]))}. When you’re ready, tap get my grocery list.` : 'Pick your meal from the eight dishes. You can choose up to six meals for the next two days.';
  if (S.s == 2) { const m = items().filter(k => S.ms[k]); return `Your meals need ${items().length} items, ${m.length} of them must-haves. The main ones are ${jn(m.slice(0, 5).map(H))}. Next, tell us what you already have at home.`; }
  if (S.s == 3) return `Out of ${items().length} items, ${b.length} are left to buy. Tick what you have at home, or press edit to enter a smaller amount.`;
  const sb = b.find(k => I[k][7]);
  return b.length ? `You need to buy ${b.length} items: ${jn(b.slice(0, 6).map(H))}${b.length > 6 ? ' and more' : ''}. The total is about ${total(1)} rupees on Zepto, and about ${total(0)} rupees on Blinkit. One serve costs you about ${pv()} rupees, and you save about ${full() - total(S.qc)} rupees by using what’s at home.${sb ? ` If ${H(sb)} isn’t available, you can use ${I[sb][7]}.` : ''}` : 'You have everything at home. Nothing to buy.';
}
function SP() {
  try {
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
    const u = new SpeechSynthesisUtterance(hi() ? NR() : NE());
    u.lang = hi() ? 'hi-IN' : 'en-IN'; speechSynthesis.speak(u);
  } catch (e) {}
}

/* ---------- load data, then draw ---------- */
async function boot() {
  try {
    const get = u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.json(); });
    const [ing, pr, dsh, str] = await Promise.all(['data/ingredients.json', 'data/prices.json', 'data/dishes.json', 'data/strings.json'].map(get));
    U = str; PD = pr.updated || '';
    for (const x of ing) {
      const p = pr.prices[x.id];
      I[x.id] = [x.en, x.hi, '', x.unit, p.pack, p.zepto, p.blinkit].concat(x.sub ? [x.sub.en, x.sub.hi] : []);
      if (x.household) HH[x.id] = [x.household.size, x.household.unit];
      if (x.note) SX[x.id] = [x.note.en, x.note.hi];
      if (x.staple) STP.push(x.id);
      GP[x.id] = x.group || 'fresh';
      if (x.care) CR[x.id] = [x.care.caution.en, x.care.caution.hi, x.care.fix.en, x.care.fix.hi];
    }
    D = dsh.map(d => ({ id: d.id, n: [d.en, d.hi], m: d.minutes, w: d.heavy ? 1 : 0, t: d.slots, p: [d.prep.en, d.prep.hi], k: d.equipment ? [d.equipment.en, d.equipment.hi] : ['', ''], items: d.items }));
    dsh.forEach(d => { IMG[d.id] = d.image; });
    VD = dsh.filter(d => d.featured).sort((a, b) => a.featured - b.featured).map(d => d.id);   /* featured: 1,2,3 = order of the Screen 1 plate-cost cards */
    S.cx = S.cx || {}; Object.assign(I, S.cx);
  } catch (e) {
    $('app').innerHTML = '<p style="padding:16px">Could not load the data files. If you opened index.html directly, run a local server instead: <code>npx serve .</code> or <code>python3 -m http.server</code>, then open the address it prints.</p>';
    return;
  }
  if (S.s > 0 && !S.n) S.s = 0;
  R();
}
boot();
