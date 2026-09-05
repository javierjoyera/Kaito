# Tasks: Add Explicit Logout

## Review Workload Forecast

Estimated changed lines: +442 generated; 520–700 authored. PR3's narrow `size:exception` covers generated lockfile only; delivery remains `ask-on-risk`.

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

Tracker `feat/explicit-logout` is draft/no-merge. Chain: `PR1 auth → PR2 normalization → PR3 dependency bootstrap → PR4 harness → PR5 control → PR6 surface → PR7 safety → tracker → main`. PR3 `chore/explicit-logout-dom-test-dependencies` base `chore/pnpm-lock-normalization`; PR4 `feat/explicit-logout-harness-pr3` base PR3. Historical `feat/explicit-logout-harness` is not reusable. 📍 PR3.

### Suggested Work Units

| Unit | Focused proof | Runtime harness | Rollback boundary |
|---|---|---|---|
| PR1 auth (complete) | `pnpm test:web-auth` | N/A: no UI/route | Auth boundary/tests |
| PR2 normalization | Hash/frozen/convergence/path proof | N/A: no runtime | Canonical lockfile |
| PR3 dependencies | Version/peer/engine/path/frozen proof | N/A: manifest/lock only | Manifest, lockfile, traceability |
| PR4 harness | `pnpm test:web-auth` | N/A: lifecycle tests prove runtime boundary | Harness/script |
| PR5 control | `pnpm test:web-auth` | N/A: DOM proves interaction/focus | Control/tests |
| PR6 surface | `pnpm test:web-auth && pnpm test:web-e2e` | Chromium footer placement, exclusions, responsive/accessibility integration, and keyboard activation; PR5 DOM tests prove pending/failure/retry | Dashboard/CSS/E2E |
| PR7 safety | `pnpm test:web-auth && pnpm test:web-e2e && pnpm lint:web && pnpm build:web` | Chromium success/history/direct-route/retry | Safety E2E/final wiring |

## Phase 1: Auth boundary (PR1)
- [x] 1.1 Adapter equivalence/error RED→GREEN; `browser-sign-out.ts`; gated E2E cookie mapping.
- [x] 1.2 Rejection/throw RED→GREEN; provider-neutral `explicit-logout.ts`.
- [x] 1.3 Approval-tested recovery refactor; preserve best-effort redirect.

## Phase 2: Standalone lockfile normalization (PR2)
- [x] 2.1 Clean worktree/unchanged manifests; pnpm `11.0.0`; SHA-256 hash `pnpm list -r --lockfile-only --json --depth Infinity | jq -S -c .` before canonicalization.
- [x] 2.2 Pinned `pnpm install --lockfile-only`; no manifest/dependency/source/test changes; record header/importer/package/snapshot counts.
- [x] 2.3 Equal graph hash; frozen lockfile and second lockfile-only run converge byte-for-byte.
- [x] 2.4 Paths: canonical lockfile plus OpenSpec traceability; reject source/manifests/graph/runtime/components. PR3 owns the exception; PR4–PR7 inherit none.

## Phase 3: Dependency bootstrap (PR3)
- [x] 3.1 Add only to `apps/web/package.json`, canonical `pnpm-lock.yaml`, and bounded traceability: `jsdom@29.1.1`, `global-jsdom@29.0.0`, `@testing-library/react@16.3.2`, `@testing-library/dom@10.4.1`, `@testing-library/user-event@14.6.6`; no source/harness/runtime behavior.
- [x] 3.2 Prove exact versions, peers, engines, frozen-lock acceptance, exact paths, and measured +442 lockfile lines. `size:exception` is approved ONLY for generated `pnpm-lock.yaml`; authored manifest/traceability stay review-bounded. Decision needed before PR3 apply: No.

## Phase 4: Functional DOM harness (PR4)
- [x] 4.1 RED `dom-component-test-harness.test.tsx`: isolation, lifecycle/global/act restoration, cleanup after failure, focus/body/storage, no leaked globals.
- [x] 4.2 GREEN `apps/web/shared/testing/dom-component-test-harness.ts`; extend `test:auth` to `.test.tsx`; preserve restoration/cleanup semantics; under 400 lines.

## Phase 5: Control (PR5)
- [x] 5.1 RED rendered tests for roles, awaited events, single-flight, pending/error, rejection/throw, retry, focus.
- [x] 5.2 GREEN `apps/web/features/auth/_components/logout-control.tsx` with injected use case, `aria-busy`, retry focus.

## Phase 6: Surface (PR6)

Maintainer-approved evidence allocation: the synchronous always-successful E2E auth adapter cannot honestly exercise browser pending, failure, or retry. PR5 DOM tests remain the proof for pending, single-flight, rejection/throw, retry, error clearing, and retry focus. PR6 Playwright covers footer placement, route exclusions, responsive/accessible integration, and keyboard activation; browser failure/retry and navigation/session/history/direct-route safety are deferred to PR7.

- [x] 6.1 RED→GREEN footer mount in `active-plan-dashboard.tsx` plus responsive/focus/state CSS.
- [x] 6.2 RED→GREEN `apps/web/e2e/active-plan-dashboard.spec.ts` for footer placement, keyboard activation, responsive/accessible integration, and exclusions.

## Phase 7: Safety and final verification (PR7)
- [ ] 7.1 RED→GREEN confirmed-only `location.replace("/login")`; `session-flow.spec.ts` for once-only navigation, cookie/history/direct-route safety, fail-once retry.
- [ ] 7.2 Preserve pre-verification bytes, normalize `apps/web/next-env.d.ts`, record final traceability/checks; no behavior or test-semantic changes.
