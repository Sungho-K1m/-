@AGENTS.md

# Project notes

- Requirements live in `SPEC.md` (Korean). Values marked `[예시값]` are provisional; the team decides them.
- Scoring is pure functions in `src/lib/scoring.ts`; all thresholds/weights are the constants at the top. UI and the
  S5 data page read those constants and `data/*.json` — never hardcode a number that can be derived.
- `src/lib/data.test.ts` encodes SPEC §8 data rules; `src/lib/scoring.test.ts` encodes the §10 scenarios A/B/C.
- The youth profile lives only in React state (`ProfileProvider`). No storage, no server — by spec.
- Do not set `output: "export"`: with Next 16 the static export writes segment prefetch files at paths the client
  does not request (404s on every link prefetch). Plain `next build` on Vercel prerenders every route anyway.
- Windows path contains Korean and spaces: quote it, use `-LiteralPath` in PowerShell.

## 기준
- SPEC.md가 요구사항의 유일한 기준이다. 요구사항이 바뀌면 코드보다 SPEC.md를 먼저 고친다.
- [예시값]은 팀 논의 중인 값이다. 확정되면 표시를 지우고 결정 기록에 이유를 남긴다.
- 데이터는 data/*.json, 산식은 src/lib/scoring.ts 상수, 화면은 결과 표시만 담당한다. 이 분리를 유지한다.

## 수정 요청 처리
- 요청 유형(부분 수정 / 구조 개편 / 새 계획)과 성격(동작 변경 / 버그 수정)을 먼저 확인한다. 내가 밝히지 않았으면 작업 전에 물어본다.
- 구조 개편과 새 계획은 Plan 모드로 계획부터 제시하고, 내가 승인하기 전에는 파일을 수정하지 않는다.
- 새 계획은 기존 코드를 고치지 않고 새 브랜치에서 시작한다.
- 버그 수정은 테스트를 그대로 두고 코드를 고친다. 동작 변경은 SPEC.md → 테스트 → 코드 순서로 고친다.
- 테스트를 통과시키려고 테스트를 삭제하거나 약화하지 않는다.
- 데이터·산식을 먼저 바꾸고 테스트를 통과시킨 뒤 화면을 바꾼다.
- 여러 단계가 필요한 요청은 번호 매긴 단계로 쪼개서 제시한 뒤 진행한다.

## 완료와 기록
- 작업이 끝나면 npm test 결과를 보여준다. 화면이 바뀌었으면 390px 폭에서 확인한 결과도 보여준다.
- 기능 하나가 끝날 때마다 커밋한다. 커밋 메시지에는 무엇을, 왜 바꿨는지 쓴다.
- 결정 이유는 CLAUDE.md 맨 아래 '결정 기록'에 날짜와 한 줄로 남긴다.

## 범위 밖 (요청 없이 추가하지 않음)
- 로그인, DB, 실시간 LLM 호출, Docker, CI/CD

## 결정 기록
- 2026-09-29 실질 보상은 배지와 무관하게 최대 월급 < 희망 월급이면 표시한다. 시나리오 B(J-003 임금 84점, '일치')가 실질 보상 표시를 요구하기 때문.
- 2026-09-29 adjacency.json은 인접 직무마다 공통 업무 목록을 담는다(SPEC 예시는 배열). S4의 '공통 업무' 표시에 필요해서.
- 2026-09-29 온보딩 통근 시간 기본값은 40분. 시나리오에 값이 없어 임의로 정했고, 팀 확인 전이다.
- 2026-09-29 next.config에 output: "export"를 쓰지 않는다. Next 16 정적 내보내기가 링크 미리 불러오기마다 404를 냈다.
- 2026-09-29 git 도입, 첫 커밋에 v0-prototype 태그. 이후 수정과 새 계획의 기준점.
