// wowpia 블로그 빌드 — posts/*.md → blog/*.html + blog/index.html
//
// 사용:
//   node scripts/build-blog.mjs
//
// 입력:  posts/{slug}.md  (frontmatter: title, date, description, tags, lang)
// 출력:  blog/{slug}/index.html  + blog/index.html
//
// 디자인:
//   - 단일 디자인 시스템 (index.html 과 같은 토큰)
//   - 사이드바 / TOC 없음 (모바일 우선)
//   - 한 페이지당 1 article
//   - SEO: title, description, og:image, canonical, JSON-LD

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const POSTS_DIR = resolve(ROOT, 'posts');
const OUT_DIR = resolve(ROOT, 'blog');
const SITE_URL = 'https://wowpia.kr';

marked.setOptions({ gfm: true, breaks: false });

// 모든 링크 새창에서 열리게 (target="_blank" + rel="noopener")
// 단, 같은 도메인(wowpia.kr) 또는 상대 경로는 같은 창
marked.use({
  renderer: {
    link({ href, title, text }) {
      const isInternal = href.startsWith('/') || href.startsWith('#') || href.startsWith('https://wowpia.kr');
      const titleAttr = title ? ` title="${title.replace(/"/g, '&quot;')}"` : '';
      const targetAttr = isInternal ? '' : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${href}"${titleAttr}${targetAttr}>${text}</a>`;
    },
  },
});

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function loadPosts() {
  if (!existsSync(POSTS_DIR)) return [];
  const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const posts = files.map(f => {
    const raw = readFileSync(resolve(POSTS_DIR, f), 'utf-8');
    const { data, content } = matter(raw);
    // frontmatter slug 우선, 없으면 파일명에서 추출
    const slug = data.slug || basename(f, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    const date = data.date ? new Date(data.date) : new Date();
    const lang = data.lang || 'ko';
    return {
      slug,
      file: f,
      title: data.title || slug,
      description: data.description || '',
      date,
      tags: data.tags || [],
      lang,
      // ko = /blog/{slug}/, 그 외 = /blog/{lang}/{slug}/
      urlPath: lang === 'ko' ? `/blog/${slug}/` : `/blog/${lang}/${slug}/`,
      // 같은 translationKey 다른 언어 = 번역 버전 (hreflang 자동 연결)
      translationKey: data.translationKey || slug,
      cover: data.cover || null,
      content,
    };
  });
  return posts.sort((a, b) => b.date - a.date);
}

const SHARED_HEAD = `
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <meta name="theme-color" content="#1D9E75">`;

const SHARED_CSS = `
    :root {
      --bg: #FAFAF7; --ink: #0F1419; --ink-soft: #3A3F47; --ink-mute: #7A828C;
      --rule: #E5E5E0; --accent: #1D9E75; --accent-dark: #157A5A;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: var(--bg); color: var(--ink);
      font-size: 17px; line-height: 1.7; -webkit-font-smoothing: antialiased;
    }
    a { color: var(--accent-dark); text-decoration: underline; text-underline-offset: 3px; }
    a:hover { color: var(--accent); }

    .nav {
      max-width: 760px; margin: 0 auto; padding: 24px 24px 16px;
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1px solid var(--rule);
    }
    .nav-brand {
      font-family: 'Fraunces', serif; font-size: 22px; font-weight: 600;
      color: var(--ink); text-decoration: none;
    }
    .nav-brand em { color: var(--accent); font-style: italic; }
    .nav-links { display: flex; gap: 20px; font-size: 14px; }
    .nav-links a { color: var(--ink-soft); text-decoration: none; font-weight: 500; }
    .nav-links a:hover { color: var(--accent); }

    .container { max-width: 760px; margin: 0 auto; padding: 32px 24px 80px; }

    .post-meta {
      color: var(--ink-mute); font-size: 13px; margin-bottom: 8px;
      display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
    }
    .post-meta time { font-family: 'JetBrains Mono', monospace; }
    .post-meta .tag {
      padding: 2px 8px; background: var(--rule); border-radius: 4px;
      font-size: 11px; font-weight: 600; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.4px;
    }

    article h1 {
      font-family: 'Fraunces', serif; font-size: 38px; line-height: 1.2;
      margin-bottom: 8px; font-weight: 600; color: var(--ink); letter-spacing: -0.01em;
    }
    article .post-desc {
      font-size: 18px; color: var(--ink-soft); margin: 8px 0 32px;
      padding-bottom: 24px; border-bottom: 1px solid var(--rule); line-height: 1.5;
    }
    article h2 {
      font-family: 'Fraunces', serif; font-size: 26px; margin: 36px 0 12px;
      font-weight: 600; color: var(--ink);
    }
    article h3 { font-size: 20px; margin: 28px 0 10px; font-weight: 600; }
    article p { margin-bottom: 18px; color: var(--ink); }
    article ul, article ol { margin-bottom: 18px; padding-left: 24px; }
    article li { margin-bottom: 6px; }
    article code {
      background: #F1F0EA; padding: 2px 6px; border-radius: 4px;
      font-family: 'JetBrains Mono', monospace; font-size: 14px; color: var(--accent-dark);
    }
    article pre {
      background: #1A1D22; color: #F1F0EA; padding: 18px; border-radius: 8px;
      margin: 18px 0; overflow-x: auto;
    }
    article pre code { background: transparent; color: inherit; padding: 0; font-size: 14px; }
    article blockquote {
      border-left: 3px solid var(--accent); padding-left: 18px;
      color: var(--ink-soft); font-style: italic; margin: 18px 0;
    }
    article img { max-width: 100%; height: auto; border-radius: 8px; margin: 18px 0; }

    .post-list { list-style: none; padding: 0; }
    .post-list li {
      padding: 24px 0; border-bottom: 1px solid var(--rule);
    }
    .post-list li:last-child { border-bottom: none; }
    .post-list a {
      text-decoration: none; color: inherit; display: block;
    }
    .post-list a:hover .post-title { color: var(--accent); }
    .post-title {
      font-family: 'Fraunces', serif; font-size: 22px; line-height: 1.3;
      margin: 6px 0; color: var(--ink); transition: color 0.15s;
    }
    .post-card-desc { color: var(--ink-soft); font-size: 15px; line-height: 1.55; }

    .footer {
      max-width: 760px; margin: 0 auto; padding: 32px 24px;
      border-top: 1px solid var(--rule); color: var(--ink-mute); font-size: 13px;
      display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    }`;

const LANG_LABELS = { ko: '한국어', en: 'English', ja: '日本語' };

function navHtml(activePage = 'blog', lang = 'ko') {
  const blogIndex = lang === 'ko' ? '/blog/' : `/blog/${lang}/`;
  return `<nav class="nav">
    <a class="nav-brand" href="/">wow<em>pia</em></a>
    <div class="nav-links">
      <a href="/" ${activePage === 'home' ? 'aria-current="page"' : ''}>Home</a>
      <a href="${blogIndex}" ${activePage === 'blog' ? 'aria-current="page"' : ''}>Blog</a>
      <span style="color:var(--ink-mute);font-size:12px">|</span>
      <a href="/blog/" style="font-size:12px;color:${lang === 'ko' ? 'var(--accent)' : 'var(--ink-mute)'}">KO</a>
      <a href="/blog/en/" style="font-size:12px;color:${lang === 'en' ? 'var(--accent)' : 'var(--ink-mute)'}">EN</a>
      <a href="/blog/ja/" style="font-size:12px;color:${lang === 'ja' ? 'var(--accent)' : 'var(--ink-mute)'}">JA</a>
    </div>
  </nav>`;
}

function footerHtml() {
  return `<footer class="footer">
    <div>© ${new Date().getFullYear()} Info-Gate Inc. — wowpia</div>
    <div><a href="https://wowpia.kr">wowpia.kr</a></div>
  </footer>`;
}

/** marked 의 strikethrough 가 한 paragraph 내 짝지은 ~ 를 strike 로 처리하는 함정 회피.
 *  숫자~숫자 (범위 표현) 를 en-dash 로 치환. `~~text~~` 의도된 strike 는 보존. */
function preprocessMarkdown(content) {
  return content.replace(/(\d)~(?!~)(\d)/g, '$1–$2');
}

/** 발음 syntax `[pron:word]` → 클릭 시 음성 재생 span. Web Speech API.
 *  Barolingo 영어 학습 글에서 활용 — LLM 이 [pron:apple] 같이 wrap 하면 click 가능. */
function applyPronunciation(html, lang) {
  // 본문 lang 기준 — 'ko' / 'ja' 글의 경우 영어 발음 학습 컨텍스트
  // 'en' 글은 본문 자체가 영어라 wrap 안 함
  if (lang === 'en') return html;
  return html.replace(/\[pron:([^\]]+)\]/g, (_, word) => {
    const safe = word.replace(/"/g, '&quot;');
    return `<span class="pron-word" data-word="${safe}" title="클릭하여 발음 듣기" role="button" tabindex="0">${safe} <span class="pron-icon">🔊</span></span>`;
  });
}

function renderPost(post, allPosts) {
  const html = applyPronunciation(marked.parse(preprocessMarkdown(post.content)), post.lang);
  const dateStr = post.date.toISOString().slice(0, 10);
  const url = `${SITE_URL}${post.urlPath}`;
  const ogImage = post.cover || `${SITE_URL}/og-image.png`;

  // hreflang — 같은 translationKey 가진 다른 언어 버전
  const translations = allPosts.filter(p => p.translationKey === post.translationKey && p.lang !== post.lang);
  const hreflangTags = [
    `<link rel="alternate" hreflang="${post.lang}" href="${url}">`,
    ...translations.map(t => `<link rel="alternate" hreflang="${t.lang}" href="${SITE_URL}${t.urlPath}">`),
    translations.length > 0 ? `<link rel="alternate" hreflang="x-default" href="${url}">` : '',
  ].filter(Boolean).join('\n  ');

  return `<!DOCTYPE html>
<html lang="${post.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(post.title)} — wowpia</title>
  <meta name="description" content="${escape(post.description)}">
  <link rel="canonical" href="${url}">
  ${hreflangTags}
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escape(post.title)}">
  <meta property="og:description" content="${escape(post.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:locale" content="${post.lang === 'ko' ? 'ko_KR' : post.lang === 'ja' ? 'ja_JP' : 'en_US'}">
  <meta property="article:published_time" content="${post.date.toISOString()}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "image": ogImage,
    "datePublished": post.date.toISOString(),
    "inLanguage": post.lang,
    "url": url,
    "publisher": { "@type": "Organization", "name": "wowpia", "url": SITE_URL },
    "author": { "@type": "Organization", "name": "wowpia" },
  }, null, 2)}
  </script>${SHARED_HEAD}
  <style>${SHARED_CSS}</style>
</head>
<body>
  ${navHtml('blog', post.lang)}
  <main class="container">
    <article>
      <div class="post-meta">
        <time datetime="${dateStr}">${dateStr}</time>
        ${(post.tags || []).map(t => `<span class="tag">${escape(t)}</span>`).join('')}
        ${translations.length > 0 ? translations.map(t => `<a href="${t.urlPath}" class="tag" style="background:var(--accent-soft,#d8f3e6);color:var(--accent-dark)">${LANG_LABELS[t.lang]}</a>`).join('') : ''}
      </div>
      <h1>${escape(post.title)}</h1>
      ${post.description ? `<p class="post-desc">${escape(post.description)}</p>` : ''}
      ${html}
    </article>
  </main>
  ${footerHtml()}
  <style>
    .pron-word { display: inline-flex; align-items: center; gap: 4px; padding: 1px 6px; background: #e0f2fe; color: #0369a1; border-radius: 4px; cursor: pointer; font-weight: 600; transition: background 0.15s, transform 0.1s; user-select: none; }
    .pron-word:hover { background: #bae6fd; }
    .pron-word:active { transform: scale(0.98); }
    .pron-word.playing { background: #1d9e75; color: #fff; }
    .pron-icon { font-size: 0.85em; opacity: 0.7; }
  </style>
  <script>
    (function() {
      if (!('speechSynthesis' in window)) return;
      document.querySelectorAll('.pron-word').forEach(el => {
        const speak = () => {
          const word = el.dataset.word;
          if (!word) return;
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(word);
          u.lang = 'en-US';
          u.rate = 0.9;
          el.classList.add('playing');
          u.onend = () => el.classList.remove('playing');
          u.onerror = () => el.classList.remove('playing');
          window.speechSynthesis.speak(u);
        };
        el.addEventListener('click', speak);
        el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); speak(); } });
      });
    })();
  </script>
</body>
</html>`;
}

function renderIndex(posts, lang = 'ko') {
  const langPosts = posts.filter(p => p.lang === lang);
  const items = langPosts.map(p => {
    const dateStr = p.date.toISOString().slice(0, 10);
    return `<li>
      <a href="${p.urlPath}">
        <div class="post-meta">
          <time datetime="${dateStr}">${dateStr}</time>
          ${(p.tags || []).slice(0, 3).map(t => `<span class="tag">${escape(t)}</span>`).join('')}
        </div>
        <h2 class="post-title">${escape(p.title)}</h2>
        ${p.description ? `<p class="post-card-desc">${escape(p.description)}</p>` : ''}
      </a>
    </li>`;
  }).join('') || `<li style="color:var(--ink-mute);text-align:center;padding:60px 0;">No posts yet in ${LANG_LABELS[lang]}.</li>`;

  const indexUrl = lang === 'ko' ? `${SITE_URL}/blog/` : `${SITE_URL}/blog/${lang}/`;
  const titleByLang = { ko: 'Blog — wowpia', en: 'Blog — wowpia', ja: 'ブログ — wowpia' };
  const descByLang = {
    ko: 'wowpia 블로그 — 앱 출시 노트, 개발 일기, 사용 팁.',
    en: 'wowpia blog — app release notes, dev journal, how-to tips.',
    ja: 'wowpia ブログ — アプリリリースノート、開発日誌、活用Tips.',
  };
  const headingByLang = { ko: 'Blog', en: 'Blog', ja: 'ブログ' };

  // hreflang for index
  const hreflangs = ['ko', 'en', 'ja'].map(l => {
    const url = l === 'ko' ? `${SITE_URL}/blog/` : `${SITE_URL}/blog/${l}/`;
    return `<link rel="alternate" hreflang="${l}" href="${url}">`;
  }).join('\n  ');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleByLang[lang]}</title>
  <meta name="description" content="${descByLang[lang]}">
  <link rel="canonical" href="${indexUrl}">
  ${hreflangs}
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}/blog/">
  <meta property="og:title" content="${titleByLang[lang]}">
  <meta property="og:description" content="${descByLang[lang]}">
  <meta property="og:url" content="${indexUrl}">
  <meta property="og:image" content="${SITE_URL}/og-image.png">${SHARED_HEAD}
  <style>${SHARED_CSS}</style>
</head>
<body>
  ${navHtml('blog', lang)}
  <main class="container">
    <h1 style="font-family:'Fraunces',serif;font-size:36px;font-weight:600;margin-bottom:6px;letter-spacing:-0.01em;">${headingByLang[lang]}</h1>
    <p style="color:var(--ink-soft);margin-bottom:32px;">${descByLang[lang]}</p>
    <ul class="post-list">${items}</ul>
  </main>
  ${footerHtml()}
</body>
</html>`;
}

function renderRSS(posts, lang = 'ko') {
  const langPosts = posts.filter(p => p.lang === lang).slice(0, 30);
  const items = langPosts.map(p => `<item>
      <title><![CDATA[${p.title}]]></title>
      <link>${SITE_URL}${p.urlPath}</link>
      <guid isPermaLink="true">${SITE_URL}${p.urlPath}</guid>
      <pubDate>${p.date.toUTCString()}</pubDate>
      <description><![CDATA[${p.description}]]></description>
    </item>`).join('\n');

  const titleByLang = { ko: 'wowpia Blog', en: 'wowpia Blog', ja: 'wowpia ブログ' };
  const descByLang = {
    ko: 'wowpia 블로그 — 앱 출시 노트, 개발 일기, 사용 팁.',
    en: 'wowpia blog — app release notes, dev journal, how-to tips.',
    ja: 'wowpia ブログ — アプリリリースノート、開発日誌、Tips.',
  };
  const langCode = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP' };
  const indexUrl = lang === 'ko' ? `${SITE_URL}/blog/` : `${SITE_URL}/blog/${lang}/`;

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${titleByLang[lang]}</title>
    <link>${indexUrl}</link>
    <description>${descByLang[lang]}</description>
    <language>${langCode[lang]}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;
}

function renderSitemap(posts) {
  const indexUrls = [
    { loc: `${SITE_URL}/`, hreflang: null },
    { loc: `${SITE_URL}/blog/`, hreflang: 'ko' },
    { loc: `${SITE_URL}/blog/en/`, hreflang: 'en' },
    { loc: `${SITE_URL}/blog/ja/`, hreflang: 'ja' },
  ];

  // post URLs with hreflang alternates
  const postsByKey = {};
  for (const p of posts) {
    if (!postsByKey[p.translationKey]) postsByKey[p.translationKey] = [];
    postsByKey[p.translationKey].push(p);
  }

  const postEntries = posts.map(p => {
    const alternates = postsByKey[p.translationKey];
    const xhtmlLinks = alternates.length > 1
      ? alternates.map(a => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${SITE_URL}${a.urlPath}"/>`).join('\n') + '\n'
      : '';
    return `  <url>
    <loc>${SITE_URL}${p.urlPath}</loc>
    <lastmod>${p.date.toISOString().slice(0, 10)}</lastmod>
${xhtmlLinks}  </url>`;
  });

  const indexEntries = indexUrls.map(u => `  <url><loc>${u.loc}</loc></url>`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${indexEntries.join('\n')}
${postEntries.join('\n')}
</urlset>`;
}

function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const posts = loadPosts();
  console.log(`▶ ${posts.length} posts loaded`);

  // 개별 post HTML — lang 별 디렉토리
  for (const post of posts) {
    const relPath = post.urlPath.replace(/^\//, '').replace(/\/$/, '');
    const dir = resolve(OUT_DIR, ...relPath.split('/').slice(1)); // blog/{slug} or blog/en/{slug}
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'index.html'), renderPost(post, posts));
    console.log(`  ✓ ${post.urlPath} [${post.lang}]`);
  }

  // 언어별 블로그 인덱스
  for (const lang of ['ko', 'en', 'ja']) {
    const dir = lang === 'ko' ? OUT_DIR : resolve(OUT_DIR, lang);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'index.html'), renderIndex(posts, lang));
    writeFileSync(resolve(dir, 'rss.xml'), renderRSS(posts, lang));
    console.log(`  ✓ /blog/${lang === 'ko' ? '' : lang + '/'} + rss.xml`);
  }

  // 통합 sitemap (모든 언어)
  writeFileSync(resolve(ROOT, 'sitemap.xml'), renderSitemap(posts));
  console.log(`  ✓ /sitemap.xml (all langs)`);

  // 언어별 통계
  const byLang = posts.reduce((acc, p) => { acc[p.lang] = (acc[p.lang] || 0) + 1; return acc; }, {});
  console.log(`\n✅ blog built — ${posts.length} posts:`, byLang);
}

main();
