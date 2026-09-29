# EMFLS 스마트홈

스마트홈에서 센서, 연결 방식, 컨트롤러와 자동화 규칙이 나누는 역할을 한국어로 설명하는 EMFLS 네트워크 사이트입니다.

- Site No.: 17
- Repository: `emfls/emfls-smarthome`
- Production domain: `https://smarthome.emfls.com/`
- Framework: Astro + TypeScript
- Output: Static Cloudflare Pages
- Current phase: Foundation/Search Launch · Owner Priority Override 11
- Indexing: `noindex` remains until the minimum Indexability Gate is evidenced

The first foundation covers the system model `센서 → 조건 → 자동화 → 결과`, protocol and device-role distinctions, safe-start guidance, About, Privacy, Contact, Editorial Policy, canonical URLs, `robots.txt`, `sitemap.xml`, a custom 404 and an IndexNow key file. It does not control devices or promise model-level compatibility.

See [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) for evidence and provider milestones, [`CONTENT_POLICY.md`](./CONTENT_POLICY.md) for sourcing rules, and [`PROJECT_HISTORY.md`](./PROJECT_HISTORY.md) for repo-level history.

## Local commands

```sh
npm ci
npm run check
npm test
npm run build
```
