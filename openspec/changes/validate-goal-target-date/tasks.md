# Tasks: Validate Goal Target Date (#119)

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated authored changed lines | 260–420, including tests and planning |
| Files | 2 new, 7 modified; no generated artifacts counted |
| 400-line budget risk | Medium |
| 800-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR with work-unit commits |
| Delivery strategy | ask-always |
| Chain strategy | none needed unless scope expands |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Date-only contract and taxonomy | PR 1 | `pnpm --filter web exec tsx --test features/onboarding/_domain/goal-target-date.test.ts features/onboarding/_domain/step-validation.test.ts` | N/A — pure domain behavior | Revert the two domain files and tests |
| 2 | Atomic wizard gating and Goal field UX | PR 1 | `pnpm test:web-onboarding` | N/A — covered by onboarding runner | Revert listed onboarding component changes |
| 3 | Browser proof and quality evidence | PR 1 | `pnpm --filter web exec playwright test e2e/onboarding.spec.ts --grep "goal target date"` | Playwright Chromium onboarding scenario | Revert E2E assertions only |

## Phase 1: RED — Domain and taxonomy

- [x] 1.1 Add failing cases to `goal-target-date.test.ts` for canonical/existent, malformed/impossible/leap/year-zero, past/today/tomorrow, browser-zone, Madrid-midnight, and DST values; prove `invalid_date`/`not_future`. Evidence: focused unit command fails.
- [x] 1.2 Add failing cases to `step-validation.test.ts` for `required`, distinct Spanish messages, injected `madridToday`, and value preservation; keep backend/API files untouched. Evidence: focused unit command fails only at new assertions.

## Phase 2: GREEN — Minimum date contract and mapping

- [x] 2.1 Create `apps/web/features/onboarding/_domain/goal-target-date.ts` with injected-clock Madrid extraction, Gregorian validation for `0001..9999`, manual tomorrow calculation, and date-only comparison; avoid `Date.parse` and local getters. Evidence: focused unit command passes.
- [x] 2.2 Modify `step-validation.ts` and its tests to map missing/invalid/non-future outcomes while accepting tomorrow/later and preserving the draft string. Evidence: focused unit command passes with unchanged request types.

## Phase 3: TRIANGULATE — Atomic orchestration and field contract

- [x] 3.1 Add failing wizard/component coverage for one clock call per boundary, focus/Continue refresh, pre-PUT revalidation, rollover blocking/no request, and payload `validation_date` matching submission `today`; then modify `onboarding-wizard.tsx`/`onboarding-step-content.tsx`. Evidence: `pnpm test:web-onboarding` passes.
- [x] 3.2 Modify `goal-step.tsx` and `field-messages.ts` for `min=tomorrow`, persistent Madrid guidance, `aria-describedby`, `aria-invalid`, alert feedback, and unchanged rejected values; native `min` remains guidance. Evidence: onboarding regression passes.
- [x] 3.3 Add `apps/web/e2e/onboarding.spec.ts` coverage for rendered `min`/guidance association, rejected-value preservation, and no PUT; run the focused Playwright command and record the pass.

## Phase 4: REFACTOR and final evidence (green only)

- [x] 4.1 While green, simplify names/fixtures without changing boundaries; verify no product-routing import, generic utility, backend change, logout, or unrelated refactor. Evidence: focused unit command and `pnpm test:web-onboarding` pass.
- [x] 4.2 Run `pnpm lint:web && pnpm build:web`; record successful lint/build, focused E2E result when 3.3 applies, and final authored diff/stat showing the 800-line budget remains low.
