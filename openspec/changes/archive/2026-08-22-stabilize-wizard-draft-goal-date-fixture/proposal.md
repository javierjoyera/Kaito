# Proposal: Stabilize Wizard Draft Goal-Date Fixture

## Intent

Keep the wizard-draft navigation tests valid when the ambient clock advances to 2031. The shared `completeDraft.goal.target_date` fixture currently expires, so tests fail for time passage rather than the navigation behavior they exercise.

## Scope

### In Scope
- Replace or protect exactly the expiring `completeDraft.goal.target_date` fixture in `apps/web/features/onboarding/_domain/wizard-draft.test.ts` with an intentional date strictly after the 2031 probe, such as `2099-10-03`.

### Out of Scope
- Production code, prior changes, backend, API, request contracts, and unrelated tests.
- Date-boundary injection or changes to `firstIncompleteStepIndex`, `validateStep`, or their callers.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None. This corrects test data without changing specified behavior.

## Approach

Update only the ambient-clock-sensitive fixture date. Preserve the tested calls and assertions so the suite continues to cover focused wizard-draft navigation behavior while proving durability under the independent 2031 clock.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/features/onboarding/_domain/wizard-draft.test.ts` | Modified | Make one shared goal-date fixture remain future-valid under the 2031 probe. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| A replacement date expires too soon | Low | Use an intentional canonical date strictly after 2031, preferably 2099. |
| Scope expands into production date handling | Low | Restrict the diff to the single test fixture and reject contract or caller changes. |

## Rollback Plan

Revert only the goal-date fixture line in `apps/web/features/onboarding/_domain/wizard-draft.test.ts`.

## Dependencies

- None.

## Success Criteria

- [ ] The focused test passes: `pnpm --filter web exec tsx --test features/onboarding/_domain/wizard-draft.test.ts`.
- [ ] The same focused test passes under the preserved 2031 probe: `pnpm --filter web exec node --import 'data:text/javascript,globalThis.Date%3Dclass%20extends%20Date%7Bconstructor(...args)%7Bsuper(...(args.length%3Fargs%3A%5B%222031-01-01T12%3A00%3A00.000Z%22%5D))%7Dstatic%20now()%7Breturn%20new%20Date(%222031-01-01T12%3A00%3A00.000Z%22).getTime()%7D%7D' --import tsx --test features/onboarding/_domain/wizard-draft.test.ts`.
- [ ] Onboarding regressions pass: `pnpm test:web-onboarding`.
- [ ] The implementation diff changes no file other than `apps/web/features/onboarding/_domain/wizard-draft.test.ts` and no fixture other than `completeDraft.goal.target_date`.
