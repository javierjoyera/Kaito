# Tasks: Close Goal Target-Date Verification Gaps

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 300–420 authored lines |
| Session review budget | 3,000 lines; forecast remains within budget |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | One PR, three reviewable work units |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Prove Madrid boundary and durable domain fixtures | PR 1 | `pnpm test:web-onboarding -- goal-target-date.test.ts step-validation.test.ts` | Same command; fixed UTC/Madrid instants and explicit `2030-08-01` boundary | Revert the two domain test files only |
| 2 | Prove and fix UI, accessibility, rollover, and PUT boundary | PR 1 | Focused Chromium tests in `apps/web/e2e/onboarding.spec.ts` | Freeze `2030-08-01`; queue opposite-side Madrid-midnight `Date` captures; count PUTs | Revert `onboarding-wizard.tsx` and E2E additions |
| 3 | Validate the complete correction and evidence | PR 1 | `pnpm test:web-onboarding && pnpm lint:web && pnpm build:web` | N/A: quality commands have no additional runtime harness beyond their executed suites | Revert the complete four-file frontend/test change |

## Phase 1: RED Tests — Domain and Boundary Evidence

- [x] 1.1 RED: In `goal-target-date.test.ts`, assert Madrid `2030-01-02` versus UTC `2030-01-01`, plus today/tomorrow results immediately before and after March/October DST transitions.
- [x] 1.2 RED: In `step-validation.test.ts`, replace `2026-12-01` assumptions with explicit `madridToday` and future Trail/Ultra targets; prove fixtures do not depend on ambient time.

## Phase 2: RED Tests — Observable Onboarding Behavior

- [x] 2.1 RED: In `onboarding.spec.ts`, freeze `2030-08-01`; assert exact `min="2030-08-02"`, persistent help text, preserved rejected value, `aria-invalid`, exact `aria-describedby`, and `#goal-target-date-error[role="alert"]` message.
- [x] 2.2 RED: Add queued two-capture rollover proof: first capture accepts `2030-08-02`, pre-PUT capture rejects after Madrid midnight, preserves the value, and emits zero `PUT`; add valid-flow proof for exactly one PUT and exact keys `{ snapshot, validation_date }`.

## Phase 3: GREEN — Minimal Production Correction

- [x] 3.1 In `onboarding-wizard.tsx`, retain validation-boundary checking, capture a distinct boundary after conditional clearing immediately before save/complete, revalidate Goal, block rejected submission, refresh guidance, and pass the second `today` as `validation_date` without changing the PUT contract.

## Phase 4: Verification and Evidence

- [x] 4.1 Run focused unit/E2E suites, `pnpm test:web-onboarding`, `pnpm lint:web`, and `pnpm build:web`; record exact commands/results and only claim scenarios backed by passing runtime assertions.
- [x] 4.2 Confirm no backend/request-shape files changed and document rollback as reverting the listed frontend/test files. The exact pre-RED Playwright test count and output hash are unavailable, so no stronger modified-test safety-net evidence is claimed.
