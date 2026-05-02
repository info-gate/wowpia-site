---
title: "Barolingo 1.0.4 — Thank You to Our First Learners"
slug: "barolingo-1-0-4-update-first-users-en"
lang: en
date: 2026-05-02
description: "Barolingo 1.0.4 update — onboarding fix, AI chunk explanation in 10 languages (lazy LLM cache), email update"
tags: ["Barolingo", "EnglishLearning", "ChunkMethod", "ESL", "AppUpdate"]
primaryKeyword: "Barolingo update"
app: barolingo
ogImage: ""
---

## To Our First Real Learners

Today, the first real users showed up in the Barolingo ranking. We don't know your names but we wanted to say it across the screen — **thank you**.

We're a tiny indie app studio. Each new daily user is a big deal. Here's what changed in 1.0.4 based on your feedback.

## What's New in 1.0.4

### 1. Notification taps & relaunches now skip onboarding

Tapping a learning reminder, or simply reopening the app, used to drop you back into the onboarding screen even when you were already logged in. Fixed — **logged-in users now go straight to the home screen**.

Under the hood: token-based session restore → /me fetch → correct routing branch (main / onboarding / sign-in).

### 2. 💡 Chunk "Explain More" — auto in your language (10 supported)

The short translation next to each English chunk isn't always enough. In the dictionary, tap the new **"💡 Explain"** button on any chunk and an AI will show a **4-layer explanation**:

- **Literal** — word-by-word translation
- **Natural** — how a native speaker would actually say it in your language
- **Nuance** — when to use it (formal vs casual, common situations)
- **Similar expressions** — alternative ways to say the same thing

Korean users get Korean, **Japanese learners get 日本語, Turkish/Mongolian/Bengali/Nepali/Burmese/Kazakh/Uzbek users automatically get their own language** — 10 languages total.

Technical detail: Claude Haiku generates the explanation on first request only, then it's cached in the database. The next person who looks up the same chunk in the same language gets the cached version instantly.

### 3. Contact email updated

Contact email is now `wowpia0127@gmail.com` (Settings + Help screens).

## Coming in 1.1

- **Ranking cheer button** 👏 — 1-tap encourage other learners
- **Country flags** 🇰🇷 🇺🇸 🇯🇵 — see which country fellow learners are from
- **Better TTS** — exploring OpenAI TTS API
- **Streak fire** 🔥 — 3/7/30-day rewards
- **Friend invite** — both sides get a bonus

## Built Together

Small app, but we genuinely want it to help someone learn English. Feedback and bug reports always welcome.

📱 Download: [App Store](https://apps.apple.com/us/app/barolingo/id6762762921) · [Google Play](https://play.google.com/store/apps/details?id=com.barolingo.app)

📧 Contact: wowpia0127@gmail.com
