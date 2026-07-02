# wowpia.kr — Info-Gate Inc. official site

wowpia.kr 은 이제 **주식회사 인포게이트(Info-Gate Inc.)** 의 공식 회사 사이트입니다. `wowpia` 는 인포게이트의 프로덕트 브랜드로, 서브 페이지 `/wowpia/` 로 분리되어 있습니다.

## Structure

```
/                    ← 회사 메인 (Info-Gate Inc.)
  index.html          ─ 회사 히어로 + KPI + 사업 트랙 + Track Record + 브랜드 + 회사 정보 + Contact
/wowpia/             ← 프로덕트 브랜드 (wowpia)
  index.html          ─ 앱 그리드 (모바일 9 + Web 5)
/blog/               ← 블로그 (한/영/일)
/icons/              ← 앱·로고 아이콘
  infogate-logo.svg   ─ Info-Gate 워드마크 + 마크
  infogate-mark.svg   ─ Info-Gate 마크 단독
apps.json            ← 포트폴리오 데이터 (wowpia 페이지에서 사용)
llms.txt             ← LLM 크롤러용 회사·서비스 요약
sitemap.xml
robots.txt
```

## 회사 정보 (사이트에 공개된 팩트)

- 법인명: 주식회사 인포게이트 (Info-Gate Inc.)
- 대표이사: 박봉준 (BongJun Park)
- 설립: 2013-09-01
- 사업자등록번호: 617-86-11726
- 본점 소재지: 부산광역시 해운대구 센텀동로 51, 203호 (우동)
- 이메일: wowpia0127@gmail.com
- 프로덕트 브랜드: wowpia

## Enterprise Track Record 노출 정책

사이트에는 다음 대기업/기관 레퍼런스를 이름 그대로 노출합니다.

- 고려아연 (2015 · 2016 · 2022) — 출입통제, eMap 시스템
- 세방 (2024, 지팬스 발주) — 안전서약·차량 관리
- 나스미디어 (2016)
- 문자 발송 시스템 (2022~2024)
- 동화나라 (StoryNara, 2024)
- Game Service (2024~)

원본 자료는 `D:\2.BizDatas\201309-01-infogate\02.Biz_Part` 에 있습니다 (외부 공유 금지).

## Adding or updating a wowpia app

`apps.json` 을 편집 (`/wowpia/` 페이지에서 향후 동적으로 사용 가능).

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

## Deploy

Cloudflare Pages auto-deploys on `git push` to `main`.

## Local dev

```bash
node scripts/serve.mjs
```

Or any static HTTP server pointed at this directory.
