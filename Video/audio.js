// Bande-son synthétisée, calée sur scene.html (120 BPM, temps = 0,5 s). node audio.js son.wav
const fs = require('fs'), CFG = require('./annee.json');
const SR = 44100, DUR = 80, N = (DUR + 1) * SR;
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
const sect = t => t < 7 ? 'intro' : t < 15 ? 'logo' : t < 25 ? 'stats' : t < 37 ? 'galerie' : t < 58 ? 'etapes' : t < 63.5 ? 'cuts' : t < 66 ? 'unis' : t < 73 ? 'drop' : 'fin';
for (let bar = 0; bar < 40; bar++) {
  const t = bar * 2, c = bar % 4, S = sect(t);
  const bright = { intro: 2, logo: 4, galerie: 4, unis: 3, fin: 4 }[S] || 6;
  const pg = S === 'intro' ? .05 + bar * .006 : S === 'cuts' ? .03 : .07;
  if (t < 78) CH[c].forEach((m, j) => note(t, 2, m - (S === 'intro' ? 12 : 0), pg, (j - 1) * .5, bright));
  else CH[0].forEach((m, j) => note(t, 1.4, m, .07, (j - 1) * .5, 4, .6));
  if (S !== 'intro' && S !== 'logo' && S !== 'unis' && t < 78) for (let b = 0; b < 4; b++) bass(t + b * .5, .45, ROOT[c], S === 'galerie' ? .22 : .32);
  for (let b = 0; b < 4; b++) {
    const bt = t + b * .5;
    const full = ['stats', 'etapes', 'cuts', 'drop'].includes(S) || (S === 'galerie' && bt >= 31) || (S === 'fin' && bt < 78);
    if (full || (S === 'logo' && bt >= 11)) kick(bt, S === 'logo' ? .5 : .85);
    if (['etapes', 'drop', 'stats'].includes(S)) hat(bt + .25);
    if (['etapes', 'drop'].includes(S) && b % 2) clap(bt, .22);
  }
  if (['logo', 'stats', 'galerie', 'etapes', 'drop', 'fin'].includes(S) && t >= 9 && t < 79) // arpège en double-croches
    for (let k = 0; k < 16; k++) { const m = CH[c][k % 3] + 12 * (1 + (k >> 2) % 2); pluck(t + k * .125, m, k % 4 ? .045 : .07, Math.sin(k) * .6); }
}

// ---------- bruitages calés sur l'image ----------
whoosh(.8, 1.2, .25, 1, 200, 2500); impact(1.0, .35);                 // « Un jour. »
whoosh(3.3, 1.0, .25, -1, 200, 2500); impact(3.3, .4);                // « Une Mère. »
whoosh(5.4, 1.0, .3, 1, 200, 3000); impact(5.4, .45);                 // « Des milliers de roses. »
riser(4.4, 7.0, .3);
impact(7.0, .8, 1.3); crash(7.0, .3);                                  // flash → logo
riser(7.2, 9.6, .1);                                                   // tracé du logo
for (let j = 0; j < 13; j++) bell(9.9 + j * .09, mtof(PENTA[j]), .07, (j / 12 - .5) * 1.2); // étoiles
whoosh(11.5, .9, .25, -1, 400, 4000);                                  // titre
pop(12.75, .3); bell(12.9, mtof(86), .08);                             // pastille 2026
riser(13.6, 15, .25); whoosh(15, .8, .35); impact(15.0, .6); crash(15, .2);
counter(15.4, 17.6, CFG.rosesOffertes, CFG.rosesOffertes / 40, eOut); impact(17.6, .5); bell(17.6, mtof(93), .12); bell(17.62, mtof(86), .1);
whoosh(19.4, .5, .45, -1, 500, 6000);                                  // panoramique
whoosh(19.8, .5, .2, 1, 300, 2000); hit(20.1, .5); pop(20.9, .2); pop(21.2, .25);
riser(23.7, 25, .3); whoosh(25, .5, .45, -1, 500, 6000);
bell(26, mtof(81), .08); bell(27.5, mtof(86), .08);                    // galerie
whoosh(31.7, .8, .3, 1, 300, 3000); impact(33.0, .5); bell(33, mtof(90), .1);
riser(35.4, 37, .35); whoosh(37, .8, .4); impact(37, .6); crash(37, .2);
pop(37.3, .3); hit(37.6, .5); hit(38.4, .45);                          // « 3 gestes. C'est tout. »
for (const T of [40, 46, 52]) { whoosh(T, .5, .45, -1, 500, 6000); impact(T + .2, .55); whoosh(T + .55, .5, .15, 1, 800, 5000); bell(T + 1.0, mtof(T === 46 ? 88 : 86), .06); }
riser(56.6, 58, .3); whoosh(58, .8, .4); impact(58, .55);
for (const T of [58, 59.5, 60.5, 61.5, 62.5]) hit(T, .6);              // coupes cinétiques
impact(63.5, .7, 1.2); crash(63.5, .25); bell(63.5, mtof(81), .1); bell(63.55, mtof(88), .08);
riser(64.4, 66, .4);
impact(66, 1, 1.5); crash(66, .35);                                    // le « 8 »
whoosh(66.65, .6, .35, -1, 400, 5000); whoosh(67.25, .6, .3, -1, 400, 5000);
for (let k = 0; k < 6; k++) key(68.0 + k * .08 + (k > 2 ? .08 : 0));
whoosh(70.05, .6, .4, 1, 300, 4500);                                   // panoramique vertical
counter(70.3, 72.0, CFG.objectif, CFG.objectif / 40, eOut); impact(72.0, .8); crash(72, .3);
for (let j = 0; j < 9; j++) bell(72.0 + j * .06, mtof(PENTA[12 - j]), .05, (rnd() - .5) * 1.4);
riser(71.6, 73, .2); whoosh(73, .8, .35); impact(73, .5);
for (let j = 0; j < 13; j++) bell(73.2 + j * .09, mtof(PENTA[j]), .045, (j / 12 - .5) * 1.2);
whoosh(73.7, .9, .2, -1, 400, 3000); whoosh(74.5, .9, .15, 1, 400, 3000);
pop(75.15, .45); impact(75.2, .35); bell(75.3, mtof(86), .1);          // bouton Participer
for (const T of [76, 77.4, 78.8]) bell(T, mtof(93), .05);
for (let k = 0; k < 21; k++) key(75.8 + k * 1.2 / 21);                 // URL tapée

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
