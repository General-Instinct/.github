// Capture the actual website artwork so its geometry, color, and motion stay in sync.
// Requires Playwright (with Chromium) and ffmpeg on PATH.
// Usage: node scripts/export-website-animations.cjs http://localhost:5173
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { mkdtempSync, mkdirSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { execFileSync } = require('node:child_process');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const temporary = mkdtempSync(join(tmpdir(), 'gi-animation-'));
  const output = resolve(__dirname, '../profile/assets');
  mkdirSync(output, { recursive: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(process.argv[2] || 'https://general-instinct.com', { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const artwork = [...document.querySelectorAll('.minimal-art')].map(el => el.cloneNode(true));
      if (artwork.length !== 2) throw new Error('Expected two website technology animations');
      document.body.replaceChildren(...artwork);
      document.body.style.cssText = 'margin:0; padding:0; background:#fafaf7';
      for (const el of artwork) el.style.cssText = 'width:640px;height:310px;flex-shrink:0';
      document.getAnimations().forEach(animation => animation.pause());
    });
    for (const [name, selector, frames] of [
      ['instinctflash', '.minimal-art-flash', 72],
      ['instinctcompress', '.minimal-art-compress', 100],
    ]) {
      const directory = join(temporary, name);
      mkdirSync(directory);
      for (let frame = 0; frame < frames; frame++) {
        await page.evaluate(time => document.getAnimations().forEach(animation => { animation.currentTime = time; }), frame * 50);
        await page.locator(selector).screenshot({ path: join(directory, `${String(frame).padStart(3, '0')}.png`), animations: 'allow' });
      }
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '20', '-i', join(directory, '%03d.png'), '-filter_complex', '[0:v]split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a', '-loop', '0', join(output, `${name}.gif`)]);
      console.log(`Exported ${name}: ${frames} frames, 640 × 310`);
    }
  } finally {
    await browser.close();
    rmSync(temporary, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
