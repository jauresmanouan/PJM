// Génère chaque phrase de voix.json avec ElevenLabs → voix/<id>.mp3, en accélérant légèrement celles qui débordent.
// Clé : ELEVENLABS_API_KEY dans Video/.env.local (non versionné). Voix : VOICE_ID=... (sans VOICE_ID, liste les voix du compte).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const D = __dirname;
if (fs.existsSync(path.join(D, '.env.local'))) process.loadEnvFile(path.join(D, '.env.local'));
const KEY = process.env.ELEVENLABS_API_KEY, VOICE = process.env.VOICE_ID;
if (!KEY) { console.log('Clé absente : ajouter ELEVENLABS_API_KEY=... dans Video/.env.local'); process.exit(1); }
const api = (p, o = {}) => fetch('https://api.elevenlabs.io' + p, { ...o, headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' } });
const duree = f => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString();

(async () => {
  if (!VOICE) {
    const { voices } = await (await api('/v1/voices')).json();
    for (const v of voices) console.log(v.voice_id, ' ', v.name, ' ', Object.values(v.labels || {}).join(', '));
    console.log('\nRelancer avec VOICE_ID=<id> npm run voix');
    return;
  }
  const V = require('./voix.json');
  const MODEL = process.env.MODEL || 'eleven_v3';
  for (const [i, s] of V.entries()) {
    const f = path.join(D, 'voix', `${s.id}.mp3`), brut = path.join(D, 'voix', 'brut', `${s.id}.mp3`), place = s.fin - s.debut;
    fs.mkdirSync(path.dirname(brut), { recursive: true });
    if (!fs.existsSync(brut)) { // une seule génération par phrase : supprimer voix/brut/<id>.mp3 pour en refaire une
      const body = {
        text: s.texte, model_id: MODEL, language_code: 'fr',
        voice_settings: { stability: .5, similarity_boost: .75, style: 0, use_speaker_boost: true },
      };
      // les phrases voisines guident l'intonation (refusé par certains modèles : on réessaie sans)
      let r = await api(`/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, { method: 'POST', body: JSON.stringify({ ...body, previous_text: V[i - 1]?.texte, next_text: V[i + 1]?.texte }) });
      if (r.status === 400) r = await api(`/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, { method: 'POST', body: JSON.stringify(body) });
      if (!r.ok) { console.log(s.id, 'erreur', r.status, await r.text()); process.exit(1); }
      fs.writeFileSync(brut, Buffer.from(await r.arrayBuffer()));
    }
    // retire les silences de début et de fin, puis accélère sans changer la hauteur si la phrase déborde
    const total = duree(brut);
    const log = execFileSync('sh', ['-c', `ffmpeg -hide_banner -i "${brut}" -af silencedetect=n=-40dB:d=0.1 -f null - 2>&1`]).toString();
    const sil = [...log.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map(m => [+m[1], +m[2]]);
    const a = sil.find(([s0]) => s0 < .01)?.[1] ?? 0, z = sil.find(([, s1]) => s1 > total - .05)?.[0] ?? total;
    const d = Math.max(.1, z - a + .08), k = Math.min(1.15, d / (place - .05));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', Math.max(0, a - .03).toFixed(3), '-t', d.toFixed(3), '-i', brut, '-af', `${k > 1 ? `atempo=${k.toFixed(3)},` : ''}afade=t=out:st=${(d / Math.max(k, 1) - .06).toFixed(3)}:d=0.06`, '-b:a', '192k', f]);
    console.log(`${s.id}  ${d.toFixed(2)} s / ${place.toFixed(2)} s${k > 1 ? `  → accéléré ×${k.toFixed(2)}` : ''}${d / k > place ? '  ⚠ déborde encore' : ''}`);
  }
})();
