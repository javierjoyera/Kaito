# Tasks: Stabilize Wizard Draft Goal-Date Fixture

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 1 source line + SDD artifact lines |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | One tiny PR |
| Delivery strategy | exception-ok |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Replace the expiring fixture and prove regressions | PR 1 | `pnpm --filter web exec tsx --test features/onboarding/_domain/wizard-draft.test.ts` | N/A — test-fixture-only change | Revert one `target_date` line in `wizard-draft.test.ts` |

## Phase 1: Baseline RED

- [x] 1.1 Preserve/reproduce the existing 2031 RED using the documented Date preload; confirm exit `1`, 5 passing tests, and these 3 navigation failures: `selects the first locally incomplete executable step`, `selects the first step with a server diagnostic even when locally valid`, and `falls back to the final executable step when the draft is complete`.

## Phase 2: Fixture-Only GREEN

- [x] 2.1 In `apps/web/features/onboarding/_domain/wizard-draft.test.ts`, change only `completeDraft.goal.target_date` from `2026-10-03` to canonical `2099-10-03`; do not alter production code, calls, or assertions.

## Phase 3: Verification

- [x] 3.1 Run the focused wizard-draft suite and confirm existing navigation assertions pass unchanged.
- [x] 3.2 Re-run the exact 2031-clock probe and `pnpm test:web-onboarding`; require exit `0` for both.
- [x] 3.3 Record corrected scope evidence: native attempt ordinal 1 recorded exactly 2 changed lines between begin candidate `sha256:5eec61079fc72f7166ac64265f1ef2d7fbcf7c2d5e83d60d5b895f67bc6aa0b2` / tree `588671c5a153876df65b4121e02d38245ce97f54` and finish candidate `sha256:dc21f9a18fce67eb1780e0d3088d2bd27bdfd725e602eba508c9b3fc843de670` / tree `0c2440c868d83d306e2a29f3b71a781c2becc5d9`; the literal current `wizard-draft.test.ts` diff is only `2026-10-03` → `2099-10-03` with no assertion hunk. `goal-target-date.ts` and `goal-target-date.test.ts` are pre-existing work outside this minimal change, not new scope.
- [x] 3.4 Confirm hybrid evidence: this `tasks.md` exists under OpenSpec and the same artifact is persisted at Engram key `sdd/stabilize-wizard-draft-goal-date-fixture/tasks`; no implementation files beyond the fixture are changed.
