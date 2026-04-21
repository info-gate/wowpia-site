// wowpia OG 이미지 (1200×630) 생성 — 소셜 공유 카드용
import { writeFileSync, mkdirSync } from 'fs';
import puppeteer from 'puppeteer';

const OUT = 'c:/app/wowpia-site/og-image.png';
const FAVICON_OUT = 'c:/app/wowpia-site/favicon.png';

mkdirSync('c:/app/wowpia-site', { recursive: true });

const ogHtml = `<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;1,500&family=Inter:wght@500&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; font-family: 'Inter', sans-serif; }
  body {
    background: #FAFAF7;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px;
    position: relative;
  }
  .rule { border-top: 1px solid #E5E5E0; margin: 32px 0; }
  .logo {
    font-family: 'Fraunces', serif;
    font-weight: 500;
    font-size: 32px;
    color: #0F1419;
    letter-spacing: -0.5px;
  }
  .logo em { color: #1D9E75; font-style: normal; }
  h1 {
    font-family: 'Fraunces', serif;
    font-weight: 500;
    font-size: 104px;
    line-height: 1;
    letter-spacing: -3px;
    color: #0F1419;
    margin-top: 40px;
  }
  h1 em { font-style: italic; color: #1D9E75; }
  .sub {
    font-size: 22px;
    color: #3A3F47;
    margin-top: 40px;
    max-width: 800px;
    line-height: 1.5;
  }
  .meta {
    position: absolute;
    bottom: 80px;
    right: 80px;
    font-size: 14px;
    color: #7A828C;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-weight: 500;
  }
</style></head><body>
  <div class="logo">wow<em>pia</em></div>
  <h1>Engineering<br/><em>everyday wonder.</em></h1>
  <p class="sub">A studio designing creative, practical, useful apps — each a quiet wonder, used daily.</p>
  <div class="meta">wowpia.kr</div>
</body></html>`;

const faviconHtml = `<!DOCTYPE html><html><head><style>
  *{margin:0;padding:0;}
  html,body{width:512px;height:512px;}
  body{
    background: linear-gradient(135deg, #1D9E75 0%, #157A5A 100%);
    display:flex;align-items:center;justify-content:center;
    font-family: 'Fraunces', 'Georgia', serif;
    font-weight: 600;
    font-size: 340px;
    color: #fff;
    letter-spacing: -15px;
    position: relative;
  }
  .dot{
    position:absolute;
    top:60px;right:70px;
    width:70px;height:70px;
    border-radius:50%;
    background:#EF9F27;
  }
</style><link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600&display=swap" rel="stylesheet"></head><body>w<div class="dot"></div></body></html>`;

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

try {
  // OG
  const page1 = await browser.newPage();
  await page1.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page1.setContent(ogHtml, { waitUntil: 'networkidle0' });
  await page1.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log(`✅ ${OUT}`);

  // Favicon
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
  await page2.setContent(faviconHtml, { waitUntil: 'networkidle0' });
  await page2.screenshot({ path: FAVICON_OUT, clip: { x: 0, y: 0, width: 512, height: 512 } });
  console.log(`✅ ${FAVICON_OUT}`);
} finally {
  await browser.close();
}
