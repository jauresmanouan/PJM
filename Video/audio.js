// Bande-son synthétisée, calée sur scene.html et la voix (120 BPM, temps = 0,5 s). node audio.js son.wav
const fs = require('fs'), CFG = require('./annee.json');
const SR = 44100, DUR = CFG.duree, HK = CFG.hook, N = (DUR + 1) * SR;
const L = new Float32Array(N), R = new Float32Array(N);      // sec
const RL = new Float32Array(N), RR = new Float32Array(N);    // envoi réverbe
const duck = new Float32Array(N).fill(1);                    // sidechain du kick
let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const noise = () => rnd() * 2 - 1;
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const add = (i, v, pan = 0, rev = 0, ducked = false) => {
  if (i < 0 || i >= N) return;
  const d = ducked ? duck[i] : 1, l = v * d * Math.cos((pan + 1) * Math.PI / 4), r = v * d * Math.sin((pan + 1) * Math.PI / 4);
  L[i] += l; R[i] += r; RL[i] += l * rev; RR[i] += r * rev;
};
function svf(fc, q) { let low = 0, band = 0; return (x, f = fc) => { const F = 2 * Math.sin(Math.PI * Math.min(f, 7000) / SR); low += F * band; const high = x - low - q * band; band += F * high; return { low, band, high }; }; }

// ---------- instruments ----------
function kick(t, g = 1) {
  const s = Math.floor(t * SR), n = .45 * SR; let ph = 0;
  for (let i = 0; i < n; i++) { const x = i / SR, f = 45 + 110 * Math.exp(-x * 30); ph += 2 * Math.PI * f / SR; add(s + i, g * .9 * Math.sin(ph) * Math.exp(-x * 7) + (i < 200 ? g * .3 * noise() * (1 - i / 200) : 0)); }
  for (let i = 0; i < .35 * SR; i++) { const k = s + i; if (k < N) duck[k] = Math.min(duck[k], 1 - .7 * Math.exp(-i / SR * 9)); }
}
function hat(t, g = .12, d = 40) { const s = Math.floor(t * SR), f = svf(8000, .5); for (let i = 0; i < .08 * SR; i++) add(s + i, g * f(noise()).high * Math.exp(-i / SR * d), .3); }
function clap(t, g = .3) { const s = Math.floor(t * SR), f = svf(1500, .6); for (let i = 0; i < .25 * SR; i++) { const x = i / SR, env = (x < .03 ? (1 - (x * 100 % 1)) : 1) * Math.exp(-x * 18); add(s + i, g * f(noise()).band * env, -.2, .4); } }
function pluck(t, m, g = .12, pan = 0) { const s = Math.floor(t * SR), f = mtof(m); for (let i = 0; i < .6 * SR; i++) { const x = i / SR; add(s + i, g * (Math.sin(2 * Math.PI * f * x) + .3 * Math.sin(4 * Math.PI * f * x) * Math.exp(-x * 12)) * Math.exp(-x * 7), pan, .5, true); } }
function bell(t, f, g = .15, pan = 0) {
  const s = Math.floor(t * SR), parts = [[1, 1, 2.5], [2.76, .5, 4], [5.4, .25, 6], [8.93, .12, 9]];
  for (let i = 0; i < 2.5 * SR; i++) { const x = i / SR; let v = 0; for (const [r, a, d] of parts) v += a * Math.sin(2 * Math.PI * f * r * x) * Math.exp(-x * d); add(s + i, g * v * Math.min(1, i / 40), pan, .7); }
}
function note(t, dur, m, g, pan = 0, bright = 5, rev = .3) { // pad additif, deux voix désaccordées
  const s = Math.floor(t * SR), n = (dur + .8) * SR, f = mtof(m);
  for (let i = 0; i < n; i++) {
    const x = i / SR, env = Math.min(1, x / .35) * (x > dur ? Math.exp(-(x - dur) * 5) : 1);
    let v = 0; for (let h = 1; h <= bright; h++) v += (Math.sin(2 * Math.PI * f * h * x * 1.002) + Math.sin(2 * Math.PI * f * h * x * .998 + h)) / (h * h * .7 + .3);
    add(s + i, g * v * env * .5, pan, rev, true);
  }
}
function bass(t, dur, m, g = .35) { const s = Math.floor(t * SR), f = mtof(m); for (let i = 0; i < dur * SR; i++) { const x = i / SR, env = Math.min(1, x / .01) * Math.exp(-x * 3); add(s + i, g * Math.tanh(2 * Math.sin(2 * Math.PI * f * x)) * env, 0, 0, true); } }
// ---------- bruitages ----------
function whoosh(t, dur = .6, g = .35, dir = 1, f0 = 300, f1 = 5000) {
  const s = Math.floor((t - dur * .6) * SR), n = dur * SR, fl = svf(f0, .5), fr = svf(f0, .5);
  for (let i = 0; i < n; i++) {
    const k = i / n, env = Math.pow(Math.sin(Math.PI * Math.pow(k, .8)), 2), fc = f0 + (f1 - f0) * Math.sin(Math.PI * k);
    const pan = dir * (k * 2 - 1) * .8, a = fl(noise(), fc).band, b = fr(noise(), fc).band;
    const i2 = s + i; if (i2 < 0 || i2 >= N) continue;
    L[i2] += g * env * a * (1 - pan) * .7; R[i2] += g * env * b * (1 + pan) * .7; RL[i2] += g * env * a * .2; RR[i2] += g * env * b * .2;
  }
}
function riser(t0, t1, g = .25) {
  const s = Math.floor(t0 * SR), n = (t1 - t0) * SR, f = svf(200, .4); let ph = 0;
  for (let i = 0; i < n; i++) { const k = i / n, e = k * k; ph += 2 * Math.PI * (200 + 1800 * e) / SR; add(s + i, g * e * (f(noise(), 300 + 6000 * e).band * .8 + .15 * Math.sin(ph)), Math.sin(k * 20) * .3, .3); }
}
function impact(t, g = .6, long = 1) {
  const s = Math.floor(t * SR), f = svf(800, .7); let ph = 0;
  for (let i = 0; i < 1.8 * long * SR; i++) { const x = i / SR; ph += 2 * Math.PI * (32 + 60 * Math.exp(-x * 8)) / SR; add(s + i, g * (Math.sin(ph) * Math.exp(-x * 2.5 / long) + .5 * f(noise()).low * Math.exp(-x * 9)), 0, .35); }
}
function crash(t, g = .25) { const s = Math.floor(t * SR), f = svf(6000, .3); for (let i = 0; i < 2 * SR; i++) add(s + i, g * f(noise()).high * Math.exp(-i / SR * 2.2), 0, .5); }
function hit(t, g = .5) { kick(t, g); clap(t, g * .6); whoosh(t + .05, .3, .2, rnd() < .5 ? 1 : -1, 1000, 6000); }
function tick(t, g = .12) { const s = Math.floor(t * SR); for (let i = 0; i < .015 * SR; i++) add(s + i, g * Math.sin(2 * Math.PI * 2600 * i / SR) * (1 - i / (.015 * SR)), .2); }
function pop(t, g = .3) { const s = Math.floor(t * SR); let ph = 0; for (let i = 0; i < .12 * SR; i++) { const x = i / SR; ph += 2 * Math.PI * (300 + 900 * x / .12) / SR; add(s + i, g * Math.sin(ph) * Math.exp(-x * 25), 0, .3); } }
function key(t) { const s = Math.floor(t * SR), f = svf(3000, .8); for (let i = 0; i < .03 * SR; i++) add(s + i, .18 * f(noise()).band * Math.exp(-i / SR * 150), (rnd() - .5) * .4); }
const counter = (t0, t1, total, step, ease) => { let last = 0; for (let t = t0; t < t1; t += 1 / 120) { const v = Math.floor(total * ease((t - t0) / (t1 - t0)) / step); if (v !== last) { tick(t); last = v; } } };
const eOut = x => 1 - Math.pow(1 - x, 3);

// ---------- musique ----------
// ré majeur : D – A – Bm – G, une mesure (2 s) par accord
const CH = [[62, 66, 69], [61, 64, 69], [62, 66, 71], [62, 67, 71]], ROOT = [38, 45, 47, 43];
const PENTA = [74, 76, 78, 81, 83, 86, 88, 90, 93, 95, 98, 100, 102];
const sect = t => t < HK ? 'hook' : t < 20 ? 'intro' : t < 28 ? 'logo' : t < 37 ? 'stats' : t < 52 ? 'galerie' : t < 71 ? 'etapes' : t < 81 ? 'drop' : 'fin';
for (let bar = 0; bar < DUR / 2; bar++) {
  const t = bar * 2, c = bar % 4, S = sect(t);
  if (S === 'hook') continue; // le hook ne vit que de ses coups, puis d'un silence
  const bright = { intro: 2, logo: 4, galerie: 4, fin: 4 }[S] || 6;
  const pg = S === 'intro' ? Math.min(.07, .04 + bar * .003) : .07;
  if (t < DUR - 5) CH[c].forEach((m, j) => note(t, 2, m - (S === 'intro' ? 12 : 0), pg, (j - 1) * .5, bright));
  else CH[0].forEach((m, j) => note(t, 1.4, m, .07, (j - 1) * .5, 4, .6));
  if (S !== 'intro' && S !== 'logo' && t < DUR - 5) for (let b = 0; b < 4; b++) bass(t + b * .5, .45, ROOT[c], S === 'galerie' ? .22 : .32);
  for (let b = 0; b < 4; b++) {
    const bt = t + b * .5;
    const full = ['stats', 'etapes', 'drop'].includes(S) || (S === 'galerie' && bt >= 47) || (S === 'fin' && bt < DUR - 5);
    if (full || S === 'logo') kick(bt, S === 'logo' ? .5 : .85);
    if (['etapes', 'drop', 'stats'].includes(S)) hat(bt + .25);
    if (['etapes', 'drop'].includes(S) && b % 2) clap(bt, .22);
  }
  if (['logo', 'stats', 'galerie', 'etapes', 'drop', 'fin'].includes(S) && t < DUR - 3) // arpège en double-croches
    for (let k = 0; k < 16; k++) { const m = CH[c][k % 3] + 12 * (1 + (k >> 2) % 2); pluck(t + k * .125, m, k % 4 ? .045 : .07, Math.sin(k) * .6); }
}

// ---------- bruitages calés sur l'image ----------
// hook (temps film) : trois coups, puis tout s'arrête sur « Il manque encore la vôtre. »
counter(.05, .7, CFG.rosesOffertes, CFG.rosesOffertes / 24, eOut);
for (const T of [0, .75, 1.5]) { hit(T, .85); impact(T, .6); crash(T, .15); }
whoosh(.75, .4, .4, 1, 500, 6000); whoosh(1.5, .4, .4, -1, 500, 6000);
impact(2.25, 1, 1.6); whoosh(2.25, .5, .3, 1, 300, 3000);
bell(2.95, mtof(81), .13); bell(2.97, mtof(88), .09);                  // « la vôtre. »
bell(HK, mtof(86), .07);                                               // la voix entre, la rose s'ouvre

// le reste en temps voix, comme scene.html et voix/mots.json
const V = t => t / CFG.vitesseVoix + HK;
const hitV = (t, g) => hit(V(t), g), popV = (t, g) => pop(V(t), g), bellV = (t, m, g, pan) => bell(V(t), mtof(m), g, pan), impactV = (t, g, l) => impact(V(t), g, l);
const whooshV = (t, d, g, dir, f0, f1) => whoosh(V(t), d, g, dir, f0, f1), riserV = (a, b, g) => riser(V(a), V(b), g), crashV = (t, g) => crash(V(t), g);
const vague = T => { riserV(T - 1, T, .18); whooshV(T - .1, 1.1, .4, 1, 300, 5000); impactV(T, .4); }; // vague de pétales
const whip = T => whooshV(T, .5, .45, -1, 500, 6000);
const zoomT = T => { riserV(T - 1.2, T, .28); whooshV(T, .8, .35); impactV(T, .55); crashV(T, .18); };

bellV(4.0, 74, .06); bellV(5.24, 78, .06); bellV(6.39, 81, .07);       // intention, prière, merci
riserV(8.9, 10.5, .08);
for (let j = 0; j < 13; j++) bellV(9.7 + j * .09, PENTA[j], .05, (j / 12 - .5) * 1.2); // étoiles de Marie
vague(10.55); impactV(10.95, .7, 1.3); crashV(10.95, .2); whooshV(11.16, .6, .3, -1, 400, 5000); // le « 8 »
bellV(12.46, 81, .06); bellV(13.08, 86, .07);                          // Immaculée Conception
vague(15.7);
for (let j = 0; j < 22; j++) popV(16.4 + j * .15, .05 + j * .004);     // les roses arrivent
impactV(19.56, .8, 1.2); crashV(19.56, .25);                           // le bouquet est là
for (let j = 0; j < 9; j++) bellV(19.6 + j * .08, PENTA[j + 2], .05, (rnd() - .5) * 1.2);
bellV(22.9, 86, .08);
vague(23.6); bellV(24.8, 81, .07);
zoomT(26.05);
counter(V(26.7), V(28.0), CFG.rosesOffertes, CFG.rosesOffertes / 40, eOut); impactV(28.0, .55); bellV(28.0, 93, .12); bellV(28.02, 86, .1);
whip(29.95); hitV(30.16, .5); popV(30.78, .2); popV(31.46, .3); popV(31.78, .2);
riserV(32.3, 32.85, .2); whip(32.85);
riserV(33, 35, .1);
for (let j = 0; j < 13; j++) bellV(34.7 + j * .09, PENTA[j], .06, (j / 12 - .5) * 1.2);
popV(34.68, .3); whooshV(35.85, .9, .25, -1, 400, 4000);
vague(39.1); bellV(39.27, 81, .07); bellV(40.54, 86, .08);
bellV(43.1, 88, .07); vague(45.7); impactV(46.7, .5); bellV(46.7, 90, .1);
riserV(47.2, 48.45, .2);
zoomT(48.45); popV(48.62, .25); hitV(49.8, .5); hitV(50.55, .4);
for (const [T, N] of [[51.5, 51.74], [56.6, 56.75], [63.4, 63.64]]) { whip(T); impactV(N, .55); whooshV(N + .35, .5, .15, 1, 800, 5000); }
for (let k = 0; k < 21; k++) key(V(52.92 + k * 1.46 / 21));            // l'adresse se tape
popV(52.62, .25); bellV(55.82, 86, .06); bellV(60.44, 88, .06);
impactV(61.49, .6); whooshV(61.4, .5, .35, -1, 500, 5000);             // aucun argent à envoyer
zoomT(67.25); hitV(67.4, .6); hitV(67.98, .7);
impactV(68.85, 1, 1.5); crashV(68.85, .35); whooshV(69.06, .6, .35, -1, 400, 5000); whooshV(69.7, .6, .3, -1, 400, 5000);
bellV(71.24, 86, .08);
whip(72.5);
vague(74.95);
counter(V(75.3), V(76.3), CFG.objectif, CFG.objectif / 40, eOut); impactV(76.3, .8); crashV(76.3, .3);
for (let j = 0; j < 9; j++) bellV(76.3 + j * .06, PENTA[12 - j], .05, (rnd() - .5) * 1.4);
zoomT(77.6);
for (let j = 0; j < 13; j++) bellV(77.7 + j * .09, PENTA[j], .04, (j / 12 - .5) * 1.2);
for (let j = 0; j < 24; j++) popV(78 + j * .23, .04);                  // le bouquet se remplit
bellV(82.8, 86, .07); bellV(83.58, 90, .08);
whip(84.1);
for (let k = 0; k < 21; k++) key(V(85.18 + k * 1.56 / 21));
popV(86.6, .45); impactV(86.7, .35); bellV(86.8, 86, .1);              // bouton Participer
for (const T of [87, 87.9, 88.4]) bellV(T, 93, .05);

// ---------- réverbe (combs + allpass) ----------
function reverb(inp, out, off) {
  const combs = [1557, 1617, 1491, 1422, 1277, 1356].map(d => ({ b: new Float32Array(d + off), i: 0, s: 0 }));
  const aps = [556, 441, 341].map(d => ({ b: new Float32Array(d + off), i: 0 }));
  for (let n = 0; n < N; n++) {
    let y = 0;
    for (const c of combs) { const o = c.b[c.i]; c.s = o * .7 + c.s * .3; c.b[c.i] = inp[n] + c.s * .86; c.i = (c.i + 1) % c.b.length; y += o; }
    y *= .15;
    for (const a of aps) { const o = a.b[a.i]; const v = -y + o; a.b[a.i] = y + o * .5; a.i = (a.i + 1) % a.b.length; y = v; }
    out[n] += y;
  }
}
reverb(RL, L, 0); reverb(RR, R, 23);

// ---------- master ----------
let pk = 0;
for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * 1.1); R[i] = Math.tanh(R[i] * 1.1); pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); }
const len = DUR * SR, buf = Buffer.alloc(44 + len * 4), gain = .89 / pk;
buf.write('RIFF', 0); buf.writeUInt32LE(36 + len * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(len * 4, 40);
for (let i = 0; i < len; i++) {
  const t = i / SR, f = cl((DUR - t) / 1.2) * cl(t / .05);
  buf.writeInt16LE(Math.round(cl(L[i] * gain * f, -1, 1) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(cl(R[i] * gain * f, -1, 1) * 32767), 46 + i * 4);
}
fs.writeFileSync(process.argv[2] || 'son.wav', buf);
console.log('peak', pk.toFixed(2));
