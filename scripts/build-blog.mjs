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

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function loadPosts() {
  if (!existsSync(POSTS_DIR)) return [];
  const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const posts = files.map(f => {
    const raw = readFileSync(resolve(POSTS_DIR, f), 'utf-8');
    const { data, content } = matter(raw);
    const slug = basename(f, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    const date = data.date ? new Date(data.date) : new Date();
    return {
      slug,
      file: f,
      title: data.title || slug,
      description: data.description || '',
      date,
      tags: data.tags || [],
      lang: data.lang || 'ko',
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

function navHtml(activePage = 'blog') {
  return `<nav class="nav">
    <a class="nav-brand" href="/">wow<em>pia</em></a>
    <div class="nav-links">
      <a href="/" ${activePage === 'home' ? 'aria-current="page"' : ''}>Home</a>
      <a href="/blog/" ${activePage === 'blog' ? 'aria-current="page"' : ''}>Blog</a>
    </div>
  </nav>`;
}

function footerHtml() {
  return `<footer class="footer">
    <div>© ${new Date().getFullYear()} Info-Gate Inc. — wowpia</div>
    <div><a href="https://wowpia.kr">wowpia.kr</a></div>
  </footer>`;
}

function renderPost(post) {
  const html = marked.parse(post.content);
  const dateStr = post.date.toISOString().slice(0, 10);
  const url = `${SITE_URL}/blog/${post.slug}/`;
  const ogImage = post.cover || `${SITE_URL}/og-image.png`;
  return `<!DOCTYPE html>
<html lang="${post.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(post.title)} — wowpia</title>
  <meta name="description" content="${escape(post.description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escape(post.title)}">
  <meta property="og:description" content="${escape(post.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ogImage}">
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
    "url": url,
    "publisher": { "@type": "Organization", "name": "wowpia", "url": SITE_URL },
    "author": { "@type": "Organization", "name": "wowpia" },
  }, null, 2)}
  </script>${SHARED_HEAD}
  <style>${SHARED_CSS}</style>
</head>
<body>
  ${navHtml('blog')}
  <main class="container">
    <article>
      <div class="post-meta">
        <time datetime="${dateStr}">${dateStr}</time>
        ${(post.tags || []).map(t => `<span class="tag">${escape(t)}</span>`).join('')}
      </div>
      <h1>${escape(post.title)}</h1>
      ${post.description ? `<p class="post-desc">${escape(post.description)}</p>` : ''}
      ${html}
    </article>
  </main>
  ${footerHtml()}
</body>
</html>`;
}

function renderIndex(posts) {
  const items = posts.map(p => {
    const dateStr = p.date.toISOString().slice(0, 10);
    return `<li>
      <a href="/blog/${p.slug}/">
        <div class="post-meta">
          <time datetime="${dateStr}">${dateStr}</time>
          ${(p.tags || []).slice(0, 3).map(t => `<span class="tag">${escape(t)}</span>`).join('')}
        </div>
        <h2 class="post-title">${escape(p.title)}</h2>
        ${p.description ? `<p class="post-card-desc">${escape(p.description)}</p>` : ''}
      </a>
    </li>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog — wowpia</title>
  <meta name="description" content="wowpia 블로그 — 앱 출시 노트, 개발 일기, 사용 팁.">
  <link rel="canonical" href="${SITE_URL}/blog/">
  <meta property="og:title" content="wowpia Blog">
  <meta property="og:description" content="앱 출시 노트, 개발 일기, 사용 팁.">
  <meta property="og:url" content="${SITE_URL}/blog/">
  <meta property="og:image" content="${SITE_URL}/og-image.png">${SHARED_HEAD}
  <style>${SHARED_CSS}</style>
</head>
<body>
  ${navHtml('blog')}
  <main class="container">
    <h1 style="font-family:'Fraunces',serif;font-size:36px;font-weight:600;margin-bottom:6px;letter-spacing:-0.01em;">Blog</h1>
    <p style="color:var(--ink-soft);margin-bottom:32px;">앱 출시 노트, 개발 일기, 사용 팁.</p>
    <ul class="post-list">${items}</ul>
  </main>
  ${footerHtml()}
</body>
</html>`;
}

function renderRSS(posts) {
  const items = posts.slice(0, 30).map(p => `<item>
      <title><![CDATA[${p.title}]]></title>
      <link>${SITE_URL}/blog/${p.slug}/</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}/</guid>
      <pubDate>${p.date.toUTCString()}</pubDate>
      <description><![CDATA[${p.description}]]></description>
    </item>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>wowpia Blog</title>
    <link>${SITE_URL}/blog/</link>
    <description>wowpia 블로그 — 앱 출시 노트, 개발 일기, 사용 팁.</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;
}

function renderSitemap(posts) {
  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/blog/`,
    ...posts.map(p => `${SITE_URL}/blog/${p.slug}/`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;
}

function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const posts = loadPosts();
  console.log(`▶ ${posts.length} posts loaded`);

  // 개별 post HTML
  for (const post of posts) {
    const dir = resolve(OUT_DIR, post.slug);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'index.html'), renderPost(post));
    console.log(`  ✓ /blog/${post.slug}/`);
  }

  // 블로그 인덱스
  writeFileSync(resolve(OUT_DIR, 'index.html'), renderIndex(posts));
  console.log(`  ✓ /blog/`);

  // RSS + sitemap
  writeFileSync(resolve(OUT_DIR, 'rss.xml'), renderRSS(posts));
  writeFileSync(resolve(ROOT, 'sitemap.xml'), renderSitemap(posts));
  console.log(`  ✓ /blog/rss.xml + /sitemap.xml`);

  console.log(`\n✅ blog built — ${posts.length} posts`);
}

main();
