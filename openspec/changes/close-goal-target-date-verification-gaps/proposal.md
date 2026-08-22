# Proposal: Close Goal Target-Date Verification Gaps

## Intent

Make frontend goal-date behavior conform to its approved Madrid-date design. The failed verification found six critical gaps: five missing or partial runtime proofs and one overstated Strict TDD evidence claim. It also found expiring date fixtures.

## Scope

### In Scope
- Recapture `Europe/Madrid` time immediately before each onboarding `PUT`, revalidate the goal, block rollover-invalid values, and use that capture's `today` as `validation_date`.
- Add deterministic runtime proof for browser/UTC disagreement and strict-future behavior across DST and Madrid-midnight boundaries.
- Prove exact Madrid-tomorrow `min` and guidance, complete invalid accessibility semantics, preserved rejected input, and zero requests on rejection.
- Replace expiring `2026-10-03` and `2026-12-01` fixtures without weakening future-date assertions.
- Report Strict TDD evidence only for scenarios directly demonstrated by runtime assertions.

### Out of Scope
- Backend, API, persistence, payload-key, or request-shape changes; requests remain `{ snapshot, validation_date }`.
- New date services, shared abstractions, behavior, or requirements.
- Changes to the failed verification report, which remains evidence only.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- None. This corrective change fulfills existing `onboarding-goal-date-validation` behavior without changing requirements.

## Approach

Use the existing feature-local date primitives and controlled UI. Under Strict TDD, first encode each missing scenario, then minimally update wizard orchestration to use distinct validation and submission captures. Keep pure calendar cases in unit tests and observable request, rollover, guidance, preservation, and accessibility behavior in focused Playwright tests.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `apps/web/features/onboarding/_components/onboarding-wizard.tsx` | Modified | Fresh pre-request capture and goal gate |
| `apps/web/features/onboarding/_domain/goal-target-date.test.ts` | Modified | Timezone, DST, and rollover proof |
| `apps/web/features/onboarding/_domain/step-validation.test.ts` | Modified | Durable date fixtures |
| `apps/web/e2e/onboarding.spec.ts` | Modified | Exact UI, accessibility, no-PUT, and payload proof |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Brittle browser clock control | Medium | Limit clock manipulation; assert observable Madrid outcomes |
| Duplicate submission or stale boundary | Medium | Preserve in-flight gating and distinguish both captures in tests |
| Durable fixtures weaken intent | Low | Derive dates from explicit reference boundaries |

## Rollback Plan

Revert the onboarding orchestration and test changes. No backend, contract, or data rollback is required.

## Dependencies

- Existing `validate-goal-target-date` specification/design and its failed verification report.

## Success Criteria

- [ ] All six critical findings have direct, accurately reported runtime evidence.
- [ ] Rollover rejection sends no `PUT`; valid submission keeps `{ snapshot, validation_date }` with fresh Madrid today.
- [ ] Focused tests, onboarding regression, lint, and build pass with non-expiring fixtures.
- [ ] Delivery remains one frontend-only PR within the 3,000-line review budget.
