# Tasks: Add Explicit Logout

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 700–1,000 authored lines; four children, each target ≤400 |
| 400-line budget risk | High; auth, UI, recovery, CSS, and browser safety cross concerns |
| Chained PRs recommended | Yes |
| Suggested split | PR1 → PR2 → PR3 → PR4 on a tracker branch |
| Delivery strategy | ask-on-risk (resolved) |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

Tracker: `feat/explicit-logout` (draft/no-merge; only the tracker ultimately merges to `main`). Child branches: `feat/explicit-logout-auth` → `feat/explicit-logout`; `feat/explicit-logout-control` → auth; `feat/explicit-logout-surface` → control; `feat/explicit-logout-safety` → surface. Retarget/rebase polluted diffs. Apply exactly one child per `sdd-apply`; no size exception.

Dependency: `📍 PR1 auth` → `PR2 control` → `PR3 surface` → `PR4 safety` → tracker → `main`. First autonomous implementation slice: PR1 only; stop after its focused proof and review.

### Suggested Work Units

| Unit | Boundary (goal; dependency; start → end; out of scope) | Verification / rollback |
|---|---|---|
| PR1 `auth` | 📍 Provider-neutral contracts and recovery adapter; tracker → adapter/use-case + recovery consumers; no UI/navigation. Analogy: timing checkpoint before checkout. | RED→GREEN `pnpm test:web-auth`; runtime N/A (no browser boundary); revert new auth units/tests and recovery wiring. |
| PR2 `control` | Control behavior; PR1 → `logout-control.tsx` and tests; no dashboard/CSS/E2E. Analogy: checkout lane owns duplicate prevention. | RED→GREEN focused auth tests; runtime N/A (component contract); revert control/tests only. |
| PR3 `surface` | Dashboard placement, CSS, and surface E2E; PR2 → sidebar footer, composition seam, `active-plan-dashboard.spec.ts`; navigation safety remains PR4. Analogy: station mounting, not route exit. | RED→GREEN `pnpm test:web-auth` + `pnpm test:web-e2e`; Chromium `/plan`, excluded routes, keyboard, pending, failure/retry; revert dashboard/CSS/surface tests. |
| PR4 `safety` | Confirmed `/login` replacement and private-history safety; PR3 → `session-flow.spec.ts` plus final wiring; no new surfaces. Analogy: finish gate opens only after confirmed timing. | RED→GREEN E2E success, cookie, back/refresh/direct-route, fail-once retry; source-normalization + final integrated checks; revert navigation/safety tests. |

Every child keeps its RED proof beside the behavior it introduces; PR4 is not a tests-only delivery. If any estimate exceeds 400 lines, split that child before apply (no silent exception).

## Phase 1: Auth boundary (PR1)
- [x] 1.1 RED adapter equivalence/missing-client/error tests; add `browser-sign-out.ts` mapping Supabase and gated `kaito-e2e-session` to `{ok:true|false}`.
- [x] 1.2 RED rejection/throw tests; add `explicit-logout.ts` contracts and exception normalization.
- [x] 1.3 Existing-behavior refactor: before production edits, run the Safety Net and add approval/characterization tests for recovery in `session-recovery-controller.test.ts`; require those tests to pass before and after reusing the adapter in duplicated helpers across `onboarding-wizard.tsx`, `plan-generation.tsx`, and the dashboard, with focused regression proof that best-effort redirect is unchanged. No RED is expected because observable behavior does not change; this follows the strict-TDD approval-testing branch, not a TDD bypass.

## Phase 2: Control (PR2)
- [ ] 2.1 RED pending/double-activation/failure/retry/status/focus tests; add `logout-control.tsx` single-flight, `aria-busy`, alert, retry, and focus.

## Phase 3: Surface (PR3)
- [ ] 3.1 RED composition/surface scenarios; mount the control in `active-plan-dashboard.tsx` footer and add `apps/web/app/styles.css` responsive/focus/state rules.
- [ ] 3.2 RED then add `apps/web/e2e/active-plan-dashboard.spec.ts` for placement, keyboard, pending, failure/retry, and excluded routes.

## Phase 4: Safety and integration (PR4)
- [ ] 4.1 RED then wire confirmed-only `window.location.replace("/login")`; add `session-flow.spec.ts` for once-only navigation, cookie clearing, history/direct-route safety, and fail-once retry.
- [ ] 4.2 Record pre-verification bytes; explicitly normalize source-mutating artifacts (especially `apps/web/next-env.d.ts`), run focused checks, then lint/build and traceability review. No runtime verification is performed during planning.
