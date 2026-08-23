# Design: Close Goal Target-Date Verification Gaps

## Technical Approach

Keep the correction inside onboarding. `OnboardingWizard.handleNext` will retain its first Madrid capture for current-step validation, then take a distinct capture after conditional clearing and immediately before the selected save/completion use case. The second capture revalidates Goal and supplies that PUT's `validation_date`. Existing date primitives, UI, use cases, and `{ snapshot, validation_date }` body remain unchanged.

## Architecture Decisions

| Option | Tradeoff | Decision and rationale |
|---|---|---|
| Two captures in `handleNext` | Repeats Goal validation | Choose separate `validationBoundary` and `submissionBoundary`; only the latter can close the Madrid-midnight race and bind validation to the PUT date. |
| Existing `Clock` seam plus Playwright clock harnesses | Test-only setup is more explicit | Keep `madridDateBoundary(clock)` unchanged for pure tests. Use `page.clock.setFixedTime` for rendered boundaries and a spec-local, opt-in sequential zero-argument `Date` harness for the two synchronous captures. No production clock service or global hook is added. |
| Explicit reference-boundary fixtures | Adds fixture constants/arguments | Unit tests pass `madridToday`; E2E helpers freeze an instant before navigation. Targets are future relative to that fixed boundary, never wall-clock execution time. |

## Data Flow

    Continue → capture validationBoundary → validate current step + Goal
             → clear conditional fields
             → capture submissionBoundary → revalidate Goal
                  ├─ reject: show Goal error, preserve value, zero PUT
                  └─ pass: PUT { snapshot, validation_date: submissionBoundary.today }

No asynchronous operation occurs between the submission capture, its Goal gate, and invoking `saveOnboardingStep` or `completeOnboarding`. `saveInFlight` continues to suppress duplicate submissions.

## File Changes

| File | Action | Description |
|---|---|---|
| `apps/web/features/onboarding/_components/onboarding-wizard.tsx` | Modify | Add the distinct pre-PUT capture, refresh rendered tomorrow, and block on submission-boundary Goal errors. |
| `apps/web/features/onboarding/_domain/goal-target-date.test.ts` | Modify | Add Madrid/UTC disagreement and strict-future assertions before/after both DST transitions. |
| `apps/web/features/onboarding/_domain/step-validation.test.ts` | Modify | Replace `2026-12-01` wall-clock assumptions with explicit today/target boundaries. |
| `apps/web/e2e/onboarding.spec.ts` | Modify | Add deterministic clocks, rollover/request capture, exact UI/a11y assertions, and replace `2026-10-03` fixtures. |

## Interfaces / Contracts

No production interface changes. `madridDateBoundary(clock?: Clock)` remains the unit seam. PUT JSON remains exactly `{ snapshot, validation_date }`; no adapter, backend, persistence, route, or payload-key changes are permitted.

## Testing Strategy

| Layer | Required RED proof | Deterministic approach |
|---|---|---|
| Unit | Madrid is `2030-01-02` while UTC is `2030-01-01`; targets today/tomorrow reject/pass around the March and October DST instants | Inject fixed `Date` instances into `madridDateBoundary`, then pass extracted `today` to `validateGoalTargetDate`. Assert both extraction and strict-future result. |
| Domain regression | Valid Trail/Ultra fixtures never expire | Pass an explicit `2030-08-01` boundary with `2030-08-02` or later targets; never call the ambient clock. |
| E2E UI/a11y | Exact Madrid tomorrow and complete invalid semantics | Freeze Madrid today at `2030-08-01`; assert `min="2030-08-02"`, help contains `2030-08-02`, rejected value is unchanged, `aria-invalid="true"`, `aria-describedby="goal-target-date-help goal-target-date-error"`, and `#goal-target-date-error[role="alert"]` has the expected non-future message. |
| E2E rollover/contract | First capture accepts `2030-08-02`; queued pre-PUT capture sees Madrid `2030-08-02` and rejects with zero PUT. A passing case sends one PUT. | Arm the spec-local Date queue immediately before Continue with instants on opposite sides of Madrid midnight. Count intercepted PUTs; for the passing case assert body keys are exactly `snapshot` and `validation_date`, with the latter equal to the second capture's Madrid date. |

Run focused unit tests, `pnpm test:web-onboarding`, focused Chromium E2E, `pnpm lint:web`, and `pnpm build:web`. Strict-TDD evidence may claim only scenarios named by passing runtime assertions; record the modified-test safety net before RED.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration or flag. Rollback is limited to reverting the four frontend/test files above; request shape and persisted data need no rollback. One PR remains well below the 3,000-line review budget.

## Open Questions

None.
