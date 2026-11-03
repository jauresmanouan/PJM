// node render.js still <t...>          → still-<t>.jpg
// node render.js video <out.mp4> [fps] → vidéo muette
const puppeteer = require('puppeteer-core');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const PJM = path.resolve(__dirname, '..'); // racine du site : logo et photos
const [mode, ...args] = process.argv.slice(2);
const CFG = require('./annee.json');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true, args: ['--allow-file-access-from-files', '--force-device-scale-factor=1'],
  });
  const page = await browser.newPage();
  page.on('console', m => console.log('page:', m.text()));
  page.on('pageerror', e => console.log('pageerror:', e.message));
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('file://' + path.join(__dirname, 'scene.html'));
  const svg = fs.readFileSync(PJM + '/public/images/logoPJM3.svg', 'utf8');
  const paths = [...svg.matchAll(/<path class="(cls-\d)" d="([^"]+)"/g)].map(m => ({ cls: m[1], d: m[2] }));
  await page.evaluate(async (paths, dir, cfg) => {
    await document.fonts.load('900 100px Raleway'); await document.fonts.load('900 100px Chiffres', '0123456789'); await document.fonts.load('500 100px Raleway');
    initLogo(paths); await initPhotos(dir, cfg);
  }, paths, PJM + '/public/images/photos', CFG);
  const grab = t => page.evaluate(t => { seek(t); return document.getElementById('c').toDataURL('image/jpeg', .95).split(',')[1]; }, t);

  if (mode === 'still') {
    for (const t of args) fs.writeFileSync(path.join(__dirname, `still-${t}.jpg`), Buffer.from(await grab(+t), 'base64'));
  } else {
    const out = args[0], fps = +(args[1] || 30), n = Math.round(80 * fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', fps, '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < n; f++) {
      const b = Buffer.from(await grab(f / fps), 'base64');
      if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) console.log(`${f}/${n}`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
