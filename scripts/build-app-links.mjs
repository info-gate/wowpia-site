// wowpia.kr 짧은 redirect URL 생성기
//
// 출력: wowpia.kr/m/, /n/, /c/, /b/, /o/, /l/ — 각 앱 다운로드 page
//   - 모바일 user agent 자동 감지 → 적절한 store
//   - 데스크톱: 양 store + landing 버튼 보여주기 + 자동 redirect (가능 시)
//
// SEO: 모든 redirect 페이지 = noindex (검색 결과 X, link only)

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const APPS = {
  m: {
    name: 'Moodva',
    description: 'AI 무드/습관 트래커 — 좋은 습관이 쌓이는 하루',
    color: '#7C3AED',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.moodva.moodva',
    appStoreUrl: 'https://apps.apple.com/kr/app/moodva/id6761009900',
  },
  n: {
    name: 'Nailva',
    description: '1인 네일샵 사장님을 위한 오프라인 CRM',
    color: '#E54848',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.wowpia.nailshopmanager',
    appStoreUrl: 'https://apps.apple.com/kr/app/nailva-%EB%84%A4%EC%9D%BC%EC%83%B5-%EA%B3%A0%EA%B0%9D%EA%B4%80%EB%A6%AC/id6761184422',
  },
  c: {
    name: 'Canvly',
    description: '갤러리 운영자를 위한 올인원 SaaS',
    color: '#3A7AFE',
    landingUrl: 'https://canvly.art',
  },
  b: {
    name: 'Barolingo',
    description: 'AI 영어 학습 — 청크 단위 듣기 훈련',
    color: '#1D9E75',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.barolingo.app',
    appStoreUrl: 'https://apps.apple.com/kr/app/barolingo/id6762762921',
  },
  o: {
    name: 'OpenDocs',
    description: '무료 문서 뷰어 — PDF, HWP, Word, Excel 모두',
    color: '#D97706',
    landingUrl: 'https://info-gate.github.io/opendocs/',
  },
  l: {
    name: 'Nailoop',
    description: '네일 SNS + 예약 — 네일 자랑 + 샵 예약 한 번에',
    color: '#FF6B9D',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.nailoop.app',
  },
};

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function renderPage(slug, app) {
  const fallbackUrl = app.appStoreUrl || app.playStoreUrl || app.landingUrl || '/';
  const playUrl = JSON.stringify(app.playStoreUrl || '');
  const appUrl = JSON.stringify(app.appStoreUrl || '');
  const landingUrl = JSON.stringify(app.landingUrl || '');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escape(app.name)} 다운로드 — wowpia</title>
  <meta name="description" content="${escape(app.description)} — wowpia.kr/${slug}">
  <meta name="robots" content="noindex,follow">
  <meta property="og:title" content="${escape(app.name)} — wowpia">
  <meta property="og:description" content="${escape(app.description)}">
  <meta property="og:image" content="https://wowpia.kr/og-image.png">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="canonical" href="https://wowpia.kr/${slug}/">
  <script>
    (function() {
      var ua = navigator.userAgent || '';
      var isIOS = /iPhone|iPad|iPod/.test(ua);
      var isAndroid = /Android/.test(ua);
      var play = ${playUrl};
      var app = ${appUrl};
      var land = ${landingUrl};
      var url = null;
      if (isIOS) url = app || play || land;
      else if (isAndroid) url = play || app || land;
      // 모바일이면 1초 후 자동 redirect (사용자가 화면 인지 후)
      if (url) setTimeout(function() { location.replace(url); }, 800);
    })();
  </script>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,'Pretendard','Apple SD Gothic Neo',sans-serif;background:#FAFAF7;color:#0F1419;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;line-height:1.5}
    .card{max-width:480px;width:100%;background:#fff;border-radius:20px;padding:36px 28px;box-shadow:0 12px 40px rgba(0,0,0,0.08);text-align:center}
    .accent-bar{height:6px;background:${app.color};border-radius:3px;margin:0 -28px 28px;border-top-left-radius:20px;border-top-right-radius:20px}
    h1{font-size:32px;font-weight:800;margin-bottom:8px;letter-spacing:-0.5px}
    h1 em{color:${app.color};font-style:normal}
    .desc{color:#4b5159;margin-bottom:28px;font-size:15px}
    .btns{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}
    .btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 18px;background:#0F1419;color:#fff;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;transition:transform .1s}
    .btn:hover{transform:translateY(-1px)}
    .btn-landing{background:${app.color}}
    .footer{font-size:12px;color:#7a828c;margin-top:8px}
    .footer a{color:${app.color};text-decoration:none;font-weight:600}
    .small{font-size:11px;color:#7a828c;margin-top:6px}
  </style>
</head>
<body>
  <div class="card">
    <div class="accent-bar"></div>
    <h1>${escape(app.name)}<em>.</em></h1>
    <p class="desc">${escape(app.description)}</p>
    <div class="btns">
      ${app.playStoreUrl ? `<a class="btn" href="${app.playStoreUrl}">▶ Google Play 에서 받기</a>` : ''}
      ${app.appStoreUrl ? `<a class="btn" href="${app.appStoreUrl}"> App Store 에서 받기</a>` : ''}
      ${app.landingUrl && !app.playStoreUrl && !app.appStoreUrl ? `<a class="btn btn-landing" href="${app.landingUrl}">🌐 사이트 열기</a>` : ''}
    </div>
    <p class="small">모바일에서는 잠시 후 자동으로 스토어로 이동합니다.</p>
    <p class="footer">— <a href="/">wowpia.kr</a> · ${escape(app.name)}</p>
  </div>
</body>
</html>`;
}

function main() {
  let count = 0;
  for (const [slug, app] of Object.entries(APPS)) {
    const dir = resolve(ROOT, slug);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'index.html'), renderPage(slug, app));
    console.log(`  ✓ /${slug}/ — ${app.name}`);
    count++;
  }
  console.log(`\n✅ ${count} short URLs built (wowpia.kr/{m,n,c,b,o,l})`);
}

main();
