# Progress ledger — fair division learning site

Ruling: user approved implementation on `master` with pre-existing modified zh-TW spec. That file was not touched.

| Task | Commit | Verification | Notes/blockers |
|---|---|---|---|
| 1 Domain math | e6495ae `feat: implement fair allocation math` | `npm test -- tests/domain.test.ts` passed; `npm run build` passed | Added EF1/EFX/NSW BigInt scoring and deterministic round robin. |
| 2 Persistence | e8f9d32 `feat: persist cases allocations and ratings` | `npm test -- tests/repository.test.ts` skipped without `TEST_DATABASE_URL` | PostgreSQL not configured in environment; migration not executed against DB. |
| 3 HTTP APIs | 3e73214 `feat: expose protected case allocation and rating APIs` | `npm test -- tests/api.test.ts` passed | DB-backed happy paths require PostgreSQL. |
| 4 I18n/routing | 997838d `feat: add bilingual guided fair division lesson` | `npm test -- tests/i18n.test.ts` passed; `npm run build` passed | Next 16 warns `middleware` convention is deprecated. |
| 5 Case/allocation UI | 0d9fcf6 `feat: let visitors publish and allocate shared cases` | `npm test -- tests/case-editor.test.tsx` passed; `npm run build` passed | Manual keyboard check not separately performed. |
| 6 Rating/reveal UI | ca10d7d `feat: reveal formal results after anonymous fairness rating` | `npm test -- tests/rating-gate.test.tsx` passed; `npm run build` passed | Browser network-tab manual check not performed. |
| 7 Solver | 8b8158a `feat: estimate fractional NSW in isolated bounded solver` | `cd solver && python -m pip install -r requirements.txt && python -m pytest -q` passed | Docker image smoke not run yet. |
| 8 Fractional API | d8c9430 `feat: expose cached optional fractional comparison` | `npm test -- tests/fractional-api.test.ts` skipped without `TEST_DATABASE_URL`; `npm run build` passed | DB/solver integration unverified in this environment. |
| 9 E2E | e0438e8 `test: verify bilingual learning and voting journey`; fixes 7689811, 124a12c, 46e6e8a | `npx playwright test tests/e2e/learning.spec.ts` skipped without `DATABASE_URL` before browser launch | Browser flow requires migrated disposable PostgreSQL and installed browsers. |
| 10 Compose | 85d13c2 `feat: deploy web and solver with external Postgres via Compose` | `bash tests/smoke/compose.sh` failed immediately: `DATABASE_URL: Set DATABASE_URL for external PostgreSQL` | No external DB URL provided; Compose smoke not executed. |

Final aggregate verification: `npm test` passed (5 files passed, 2 skipped; 15 passed, 3 skipped); `npm run build` passed with Next middleware deprecation warning; `cd solver && python -m pytest -q` passed (5 passed, 1 warning); `npx playwright test tests/e2e/learning.spec.ts` skipped due missing `DATABASE_URL`; `git diff --check` returned exit 0 with only a line-ending warning for the pre-existing zh-TW spec.
