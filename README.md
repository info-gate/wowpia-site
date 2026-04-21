# wowpia-site

The main hub for wowpia — a studio engineering everyday wonder.

## Structure

- `index.html` — single-page hub with all sections
- `apps.json` — portfolio data source (edit this to add/update apps)
- `og-image.png` / `favicon.png` — social sharing + browser icons
- `scripts/generate-og.mjs` — regenerate OG image + favicon from scratch

## Adding or updating an app

Edit `apps.json`:

```json
{
  "id": "newapp",
  "name": "NewApp",
  "tagEn": "Short English tag.",
  "tagKo": "한글 태그.",
  "iconLetter": "N",
  "iconClass": "icon-newapp",
  "status": "soon",
  "statusLabel": "Soon",
  "href": null,
  "footerText": "In design"
}
```

Then add CSS for `.icon-newapp` in `index.html`:
```css
.icon-newapp { background: linear-gradient(135deg, #COLOR1, #COLOR2); }
```

## Deploy

Cloudflare Pages auto-deploys on `git push` to `main`.

## Local dev

```bash
node scripts/serve.mjs
```

Or any static HTTP server pointed at this directory.
