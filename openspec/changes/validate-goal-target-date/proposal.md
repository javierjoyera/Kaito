# Proposal: Validate Goal Target Date

## Intent

Close issue #119 by making onboarding reject invalid or non-future goal dates before progression, matching the authoritative backend rule. “Today” is the current calendar date in `Europe/Madrid`, recalculated at every validation and submission boundary.

## Scope

### In Scope
- Accept only canonical, existent `YYYY-MM-DD` dates strictly later than Madrid today using deterministic date-only logic.
- Provide a tomorrow `min`, persistent guidance, and accessible inline feedback with distinct messages for invalid calendar dates and valid dates that are not future.
- Preserve rejected values, never auto-adjust selections, and revalidate across midnight so progression is blocked with corrective guidance.
- Define strict TDD behavior boundaries for calendar validity, timezone transitions, accessibility, preservation, and submission gating.

### Out of Scope
- Backend API or validation-rule changes; backend validation remains authoritative.
- Logout, persistence or semantic changes, broad frontend architecture work, or a generic cross-feature date abstraction.
- Work beyond issue #119 or a single PR within the 800-line review budget.

## Capabilities

### New Capabilities
- `onboarding-goal-date-validation`: Frontend goal-date validation, Madrid date sourcing, guidance, accessibility, and progression behavior.

### Modified Capabilities
- None.

## Approach

Keep the rule feature-local to onboarding. Derive Madrid calendar dates from fresh instants with `Intl.DateTimeFormat(...).formatToParts()`, validate canonical dates by calendar round-trip, and compare date-only values without local-time parsing. Inject reference time into pure validation for determinism. Recalculate before validation and submission; if midnight changes the outcome, retain the value and block progression. Extend existing controlled-field and `aria-describedby`/inline-alert patterns. Implementation must follow RED-GREEN-TRIANGULATE-REFACTOR at the narrowest boundary before broader checks.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `apps/web/features/onboarding/_domain/step-validation.ts` | Modified | Canonical, existent, strictly-future date contract |
| `apps/web/features/onboarding/_components/onboarding-wizard.tsx` | Modified | Fresh Madrid date at validation/submission |
| `apps/web/features/onboarding/_components/goal-step.tsx` | Modified | Minimum, guidance, accessible feedback, preserved value |
| `apps/web/features/onboarding/_components/field-messages.ts` | Modified | Distinct frontend messages if needed |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Midnight/DST boundary disagreement | Medium | Fresh Madrid date and deterministic instant-based tests |
| Native date-input differences | Medium | Treat `min` as guidance; enforce the pure rule independently |
| Frontend/backend drift | Low | Preserve backend authority and existing request contract |

## Rollback Plan

Revert the onboarding-only validation, date-source, and field-feedback changes; no backend, API, or stored-data rollback is required.

## Dependencies

- GitHub issue #119 and the existing backend target-date rule.

## Success Criteria

- [ ] Invalid/nonexistent and today/past dates are blocked with distinct accessible messages while preserving input.
- [ ] Tomorrow and later dates pass using fresh `Europe/Madrid` date-only semantics, including midnight/DST boundaries.
- [ ] Submission keeps the existing backend contract; authored changes remain one PR under 800 lines.
