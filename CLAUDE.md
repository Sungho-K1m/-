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
