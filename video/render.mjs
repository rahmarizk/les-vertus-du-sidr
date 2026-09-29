// Deterministic frame-by-frame renderer: Chromium (Playwright) → PNG → FFmpeg.
//   node render.mjs                   full render → out/final.mp4 (+ out/poster.png)
//   node render.mjs --stills 1.2,3.8  single frames → out/stills/
//   node render.mjs --contact         one frame per second → out/contact/ (see contact.py)
//   node render.mjs --from 5 --to 9 --fps 30 --out out/preview.mp4   quick preview of a range
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const flag = (name) => args.includes(`--${name}`);
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

const browser = await playwright.chromium.launch({
  executablePath: existsSync('/opt/pw-browsers/chromium') ? undefined : undefined,
  args: ['--allow-file-access-from-files', '--font-render-hinting=none', '--disable-lcd-text'],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => { console.error('page error:', e); process.exit(1); });
await page.goto(pathToFileURL(path.join(here, 'src/index.html')).href);
await page.evaluate(() => window.ready);
const DURATION = await page.evaluate(() => window.DURATION);
const shoot = async (t, type = 'png') => {
  await page.evaluate((tt) => window.seek(tt), t);
  return page.screenshot({ type, clip: { x: 0, y: 0, width: 1080, height: 1920 }, ...(type === 'jpeg' ? { quality: 92 } : {}) });
};
const fs = await import('node:fs/promises');

if (opt('stills')) {
  mkdirSync(path.join(here, 'out/stills'), { recursive: true });
  for (const s of opt('stills').split(',')) {
    const t = parseFloat(s);
    await fs.writeFile(path.join(here, `out/stills/t${t.toFixed(2)}.png`), await shoot(t));
  }
} else if (flag('contact')) {
  mkdirSync(path.join(here, 'out/contact'), { recursive: true });
  const step = parseFloat(opt('step', '1'));
  for (let t = step / 2; t < DURATION; t += step) await fs.writeFile(path.join(here, `out/contact/t${t.toFixed(2).padStart(5, '0')}.png`), await shoot(t));
} else if (flag('mux')) {
  mux();
} else {
  const fps = parseInt(opt('fps', '60'), 10);
  const from = parseFloat(opt('from', '0')), to = parseFloat(opt('to', String(DURATION)));
  const preview = !!opt('out');
  const out = path.join(here, preview ? opt('out') : 'out/video_only.mp4');
  mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn(FFMPEG, [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((to - from) * fps);
  const started = Date.now();
  for (let f = 0; f < n; f++) {
    const buf = await shoot(from + f / fps);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 60 === 0) process.stdout.write(`frame ${f}/${n}  ${((Date.now() - started) / 1000).toFixed(0)}s\n`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log(`wrote ${out}`);
  if (!preview) {
    mux();
    await fs.writeFile(path.join(here, 'out/poster.png'), await shoot(parseFloat(opt('poster', '3.9'))));
  }
}
await browser.close();

// Picture + soundtrack → out/final.mp4 (run `python3 audio.py` first).
function mux() {
  const audio = path.join(here, 'out/soundtrack.wav');
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', path.join(here, 'out/video_only.mp4'), '-i', audio,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart',
    path.join(here, 'out/final.mp4')], { stdio: 'inherit' });
  console.log('wrote out/final.mp4');
}
