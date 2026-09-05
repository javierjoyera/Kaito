# Tasks: Add Explicit Logout

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 5,500–6,000 generated lockfile lines plus 520–700 authored lines across six children |
| 400-line budget risk | High; only PR2 has the approved generated-file exception |
| Chained PRs recommended | Yes |
| Suggested split | PR1 auth → PR2 lock normalization → PR3 harness → PR4 control-dom → PR5 surface → PR6 safety |
| Delivery strategy | feature-branch-chain; `size:exception` only for PR2 canonical `pnpm-lock.yaml` |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

Tracker `feat/explicit-logout` stays draft/no-merge. Branches: PR1 `feat/explicit-logout-auth` (complete) → PR2 `chore/pnpm-lock-normalization` → PR3 `feat/explicit-logout-harness` → PR4 `feat/explicit-logout-control-dom` → PR5 `feat/explicit-logout-surface` → PR6 `feat/explicit-logout-safety`; each targets its immediate parent. 📍 Current checkout `chore/pnpm-lock-normalization` is PR2 normalization targeting `feat/explicit-logout-auth`; do not reuse the historical harness branch for PR2 or perform Git operations. Historical `feat/explicit-logout-control` also remains untouched.

Dependency: `PR1 auth` → `📍 PR2 normalization` → PR3 harness → PR4 control-dom → PR5 surface → PR6 safety → tracker → `main`. Normalization resurfaces the track before the harness measures the runners.

### Suggested Work Units

| Unit | Focused proof | Runtime harness | Rollback boundary |
|---|---|---|---|
| PR1 auth (complete) | `pnpm test:web-auth` | N/A: no UI/route boundary | Auth adapter, use-case, recovery tests/wiring |
| PR2 normalization | Hash, frozen/convergence, exact-path proof below | N/A: semantic graph/convergence is proportional; no runtime behavior | Revert only canonical `pnpm-lock.yaml`; no manifest/graph change |
| PR3 harness | `pnpm test:web-auth` | N/A: isolated JSDOM lifecycle is the proof | Harness files, script, dependency manifest/lock delta |
| PR4 control-dom | `pnpm test:web-auth` | N/A: rendered DOM proves interaction/focus | Logout control and tests |
| PR5 surface | `pnpm test:web-auth && pnpm test:web-e2e` | Chromium dashboard/exclusions/keyboard/retry | Dashboard/CSS/surface E2E |
| PR6 safety | `pnpm test:web-auth && pnpm test:web-e2e && pnpm lint:web && pnpm build:web` | Chromium success, cookie, history/direct-route/fail-once retry | Navigation/safety E2E and final wiring |

## Phase 1: Auth boundary (PR1)
- [x] 1.1 Adapter equivalence/error RED→GREEN; add `browser-sign-out.ts` and gated E2E cookie mapping.
- [x] 1.2 Rejection/throw RED→GREEN; add provider-neutral `explicit-logout.ts` normalization.
- [x] 1.3 Approval-tested recovery refactor; preserve best-effort redirect.

## Phase 2: Standalone lockfile normalization (PR2)
- [x] 2.1 Start from clean PR2 worktree and unchanged manifests; require pnpm `11.0.0`; hash `pnpm list -r --lockfile-only --json --depth Infinity | jq -S -c .` with SHA-256 before canonicalization.
- [x] 2.2 Run pinned `pnpm install --lockfile-only` with no manifest/dependency/source/test changes; record header, importer, package, and snapshot counts when obtainable without new dependencies.
- [x] 2.3 Hash the logical graph again and require equality; prove `pnpm install --frozen-lockfile --lockfile-only` then a second lockfile-only run converge byte-for-byte.
- [x] 2.4 End with exact changed paths: canonical `pnpm-lock.yaml` only, plus declared OpenSpec traceability; reject source, manifests, dependency-graph, runtime, or component changes. `size:exception` is limited to this generated lockfile; PR3–PR6 inherit no exception.

## Phase 3: DOM harness (PR3)
- [ ] 3.1 RED `dom-component-test-harness.test.tsx`: isolation, global/act restoration, cleanup after failure, focus/body/storage, and no leaked globals.
- [ ] 3.2 GREEN `apps/web/shared/testing/dom-component-test-harness.ts`; add deferred DOM dependencies and extend `test:auth` to `.test.tsx`; keep this child ≤400 authored lines.

## Phase 4: Control (PR4)
- [ ] 4.1 RED rendered tests for roles, awaited events, single-flight, pending/error semantics, rejection/throw, retry, and focus.
- [ ] 4.2 GREEN/refactor `apps/web/features/auth/_components/logout-control.tsx` with injected use case, `aria-busy`, and retry focus.

## Phase 5: Surface (PR5)
- [ ] 5.1 RED→GREEN mount the control in `active-plan-dashboard.tsx` footer and add responsive/focus/state CSS.
- [ ] 5.2 RED→GREEN `apps/web/e2e/active-plan-dashboard.spec.ts` for placement, keyboard, pending, failure/retry, and exclusions.

## Phase 6: Safety and verification (PR6)
- [ ] 6.1 RED→GREEN confirmed-only `location.replace("/login")`; add `session-flow.spec.ts` for once-only navigation, cookie/history/direct-route safety, and fail-once retry.
- [ ] 6.2 Preserve pre-verification bytes, normalize `apps/web/next-env.d.ts`, and record traceability/final checks; package choice remains deferred until after PR2 normalization.

Line-by-line review of generated lockfile text is not the proof: graph-hash equality, canonical header/count evidence, frozen acceptance, convergence, and exact-path checks prove semantic preservation and reproducibility.
