## Exploration: stabilize-wizard-draft-goal-date-fixture

### Current State
`completeDraft` in `apps/web/features/onboarding/_domain/wizard-draft.test.ts:46` uses `2026-10-03`. `firstIncompleteStepIndex` validates every step through `validateStep` without a boundary argument, and `validateStep` therefore derives `madridDateBoundary().today` from the ambient clock. The fixture is valid under the original clock but becomes past-dated under the independent 2031 preload, causing the three navigation tests that rely on `completeDraft` to fail.

The prior `close-goal-target-date-verification-gaps` change is authority-blocked and is out of scope. No production, backend, API, request-shape, or unrelated test change is required for this isolated fixture defect.

### Affected Areas
- `apps/web/features/onboarding/_domain/wizard-draft.test.ts` — the single expiring `completeDraft.goal.target_date` fixture must become durable.
- `apps/web/features/onboarding/_domain/wizard-draft.ts` — confirms that boundary injection would require changing the production-tested function signature; it should remain untouched.
- `apps/web/features/onboarding/_domain/step-validation.ts` — confirms the existing optional `madridToday` seam, but using it here would require threading a new argument through `firstIncompleteStepIndex`, which is larger than the fixture correction and outside scope.
- `openspec/changes/close-goal-target-date-verification-gaps/verify-report.md` — read-only evidence source for the reproduced 2031 failure; do not modify.

### Approaches
1. **Derive a durable future fixture from an explicit reference** — replace the fixed 2026 target with an explicitly chosen far-future canonical date (for example, `2099-10-03`) in `completeDraft` only.
   - Pros: one test-file line, preserves the existing `firstIncompleteStepIndex` call and its purpose, avoids production API changes, remains valid under the reported 2031 clock and foreseeable verification clocks.
   - Cons: the fixture eventually expires; the chosen reference year must be intentionally documented in the implementation diff or test constant.
   - Effort: Low

2. **Inject an explicit Madrid boundary into the tested call** — add a boundary parameter to `firstIncompleteStepIndex` and pass it from these tests.
   - Pros: deterministic validation boundary and no reliance on a far-future date.
   - Cons: modifies production code and its call contract solely to support this fixture; requires changing all production callers or adding a new optional seam; risks obscuring that these tests exercise navigation, not date-boundary behavior.
   - Effort: Medium

### Recommendation
Use the explicit far-future fixture correction in `wizard-draft.test.ts` only. A durable `2099` target is the smallest safe change: it keeps `firstIncompleteStepIndex` testing local completeness and diagnostic navigation while leaving the production boundary behavior and the authority-blocked prior change untouched. Do not inject a boundary into the tested call; that would be a production refactor for a test fixture problem.

The implementation phase should run, in order:

```bash
pnpm --filter web exec tsx --test features/onboarding/_domain/wizard-draft.test.ts
pnpm --filter web exec node --import 'data:text/javascript,globalThis.Date%3Dclass%20extends%20Date%7Bconstructor(...args)%7Bsuper(...(args.length%3Fargs%3A%5B%222031-01-01T12%3A00%3A00.000Z%22%5D))%7Dstatic%20now()%7Breturn%20new%20Date(%222031-01-01T12%3A00%3A00.000Z%22).getTime()%7D%7D' --import tsx --test features/onboarding/_domain/wizard-draft.test.ts
pnpm test:web-onboarding
```

No runtime harness is applicable: this is a domain-test fixture-only correction, not a runtime behavior change.

### Risks
- A merely near-term replacement would recreate the same defect; the target must remain strictly after the simulated 2031 Madrid date.
- The 2031 preload replaces the ambient `Date` default but does not alter explicit date strings; the probe therefore directly verifies the intended durability property.
- Rollback boundary: revert only the target-date fixture line (and its immediately associated test-only constant, if introduced) in `apps/web/features/onboarding/_domain/wizard-draft.test.ts`; do not revert or edit any production file or the prior change.

### Ready for Proposal
Yes — proposal can authorize a one-file, one-PR test-fixture correction with no production or request-contract scope. The proposal should preserve the exact focused and 2031-clock commands above and the rollback boundary.
