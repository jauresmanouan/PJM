// Pose chaque phrase de voix.json à son instant, baisse la musique sous la voix, sort la vidéo finale.
// node mixer.js         → prend voix/<id>.mp3 (ou .wav, .m4a, .aiff) exportés d'ElevenLabs
// node mixer.js --test  → fabrique d'abord une voix provisoire (voix « Thomas » du Mac) pour vérifier le calage
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const D = __dirname, CFG = require('./annee.json'), VOIX = require('./voix.json');
const test = process.argv.includes('--test');
const GAIN = +(process.env.GAIN_VOIX || 1.8); // ponytail: gain fixe ; ajuster si la voix ElevenLabs sort plus faible ou plus forte
const duree = f => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString();

const clips = [];
for (const s of VOIX) {
  let f = ['mp3', 'wav', 'm4a', 'aiff'].map(e => path.join(D, 'voix', `${s.id}.${e}`)).find(fs.existsSync);
  if (test) {
    f = path.join(D, 'voix', `test-${s.id}.aiff`);
    execFileSync('say', ['-v', 'Thomas', '-r', '165', '-o', f, s.texte.replace(/«|»/g, '')]);
  }
  if (!f) { console.log(`⚠ ${s.id} manquant (voix/${s.id}.mp3) : « ${s.texte} »`); continue; }
  const d = duree(f), place = s.fin - s.debut;
  console.log(`${s.id}  ${d.toFixed(1)} s / ${place.toFixed(1)} s ${d > place ? ' ⚠ TROP LONG : raccourcir ou parler plus vite' : ''}`);
  clips.push({ f, ms: Math.round(s.debut * 1000) });
}
if (!clips.length) process.exit(1);

const inputs = ['-i', path.join(D, 'muet.mp4'), '-i', path.join(D, 'son.wav')];
let fc = '';
clips.forEach((c, i) => { inputs.push('-i', c.f); fc += `[${i + 2}:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${c.ms}:all=1[v${i}];`; });
fc += clips.map((_, i) => `[v${i}]`).join('') + `amix=inputs=${clips.length}:normalize=0,volume=${GAIN},asplit[va][vb];`;
fc += `[1:a][va]sidechaincompress=threshold=0.01:ratio=14:attack=20:release=500:mix=0.8[mus];`;
fc += `[mus][vb]amix=inputs=2:normalize=0,alimiter=limit=0.95[out]`;
const out = path.join(D, `PJM-${CFG.annee}-inscription-voix${test ? '-test' : ''}.mp4`);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', fc, '-map', '0:v', '-map', '[out]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', out], { stdio: 'inherit' });
console.log('→', out);
