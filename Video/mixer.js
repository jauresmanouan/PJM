// Pose la voix off après le hook, baisse la musique sous la voix, sort la vidéo finale.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const D = __dirname, CFG = require('./annee.json');
const GAIN = +(process.env.GAIN_VOIX || 3.2); // ponytail: gain fixe ; ajuster si la voix sort plus faible ou plus forte

const inputs = ['-i', path.join(D, 'muet.mp4'), '-i', path.join(D, 'son.wav'), '-i', path.join(D, 'voix', 'voix-off.mp3')];
let fc = `[2:a]aresample=44100,aformat=channel_layouts=stereo,atempo=${CFG.vitesseVoix},adelay=${CFG.hook * 1000}:all=1,apad=whole_dur=${CFG.duree},volume=${GAIN},asplit[va][vb];`;
fc += `[1:a][va]sidechaincompress=threshold=0.01:ratio=14:attack=20:release=500:mix=0.8[mus];`;
fc += `[mus][vb]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[out]`;
const out = path.join(D, `PJM-${CFG.annee}-inscription-voix.mp4`);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', fc, '-map', '0:v', '-map', '[out]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', out], { stdio: 'inherit' });
console.log('→', out);
