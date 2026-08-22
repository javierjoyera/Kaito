## Exploration: close-goal-target-date-verification-gaps

### Current State

The completed `validate-goal-target-date` slice is frontend-only and keeps the existing onboarding `PUT` request shape (`snapshot` plus `validation_date`). The feature-local domain module correctly extracts `Europe/Madrid` calendar dates, performs Gregorian date-only validation, and derives tomorrow. `GoalStep` already renders `min`, persistent Madrid guidance, controlled-value preservation, `aria-invalid`, `aria-describedby`, and a conditional `role="alert"` error.

The remaining problem is incomplete proof plus one implementation deviation. `OnboardingWizard.handleNext` captures one boundary before validation and reuses `boundary.today` for the subsequent save/completion request; it does not capture a distinct submission boundary immediately before the `PUT`. Existing unit coverage proves malformed dates, strict comparison for a fixed Madrid date, one extraction call, and one DST extraction instant, but not browser/UTC disagreement, strict-future behavior at DST, or Madrid-midnight rollover. The focused E2E test checks only a date-shaped `min` and partial guidance/association behavior. Fixed `2026-10-03` and `2026-12-01` fixtures are already time-sensitive and will eventually invalidate unrelated tests. The failed verification report is evidence of these gaps, not a dependency for the corrective change.

The repository is configured for interactive hybrid SDD, strict TDD, frontend-only ownership, `Europe/Madrid`, and an 800 authored-line review budget. No product requirement currently needs changing: the prior design explicitly defines separate validation and submission captures, pre-PUT goal revalidation, rollover blocking, and preservation of the backend contract.

### Affected Areas

- `apps/web/features/onboarding/_components/onboarding-wizard.tsx` — recapture Madrid time immediately before each `PUT`, revalidate the goal against that submission boundary, and use its `today` as the unchanged request `validation_date`; keep the existing no-request and navigation behavior.
- `apps/web/features/onboarding/_domain/goal-target-date.ts` — likely no production redesign; its injectable clock and date-only primitives need focused runtime tests for browser/UTC disagreement, DST strict-future behavior, and midnight date increments.
- `apps/web/features/onboarding/_domain/goal-target-date.test.ts` — add deterministic instants where UTC/browser and Madrid dates differ, assert strict-future outcomes at DST boundaries, and cover Madrid midnight rollover without claiming broader orchestration coverage.
- `apps/web/features/onboarding/_domain/step-validation.test.ts` — replace expiring fixed future fixtures with stable test-relative or sufficiently distant canonical dates while retaining explicit injected validation dates.
- `apps/web/features/onboarding/_components/goal-step.tsx` — likely no behavior change; add browser-level assertions against the existing rendered contract rather than duplicating UI logic.
- `apps/web/e2e/onboarding.spec.ts` — prove exact Madrid tomorrow `min`, matching guidance, complete invalid accessibility semantics, rejected-value preservation/no `PUT`, rollover blocking, and submission `validation_date`/goal behavior. Make fixtures durable and control the browser clock only as needed for deterministic boundaries.
- `apps/web/features/onboarding/_adapters/onboarding-api.test.ts` and `apps/web/features/onboarding/_use-cases/complete-onboarding.test.ts` — inspect/update only if the corrective orchestration tests need a sharper existing payload assertion; preserve the current JSON shape and do not add backend changes.
- `openspec/changes/validate-goal-target-date/verify-report.md` — authoritative evidence consulted only; must not be modified or copied as a dependency.

### Approaches

1. **Smallest coherent corrective slice** — make the wizard perform a fresh submission-boundary capture and pre-PUT goal revalidation, then add deterministic unit and Playwright evidence for all six verification gaps and replace expiring fixtures.
   - Pros: fixes the only substantive design deviation; closes the missing scenario evidence at the narrowest existing boundaries; preserves the backend request contract and feature-local architecture; keeps production changes limited to orchestration.
   - Cons: deterministic E2E rollover/browser-boundary control needs careful clock setup; the browser test must assert semantics rather than implementation details.
   - Effort: Medium

2. **Introduce a shared/testable wizard clock service** — thread an injected clock through wizard state and component props, then use it for load, focus, validation, and submission boundaries.
   - Pros: makes every boundary directly controllable and can simplify orchestration tests for rollover.
   - Cons: expands the public component plumbing for a single feature, increases review surface, risks speculative abstraction, and is unnecessary because the domain clock is already injectable and the current design only requires a fresh capture.
   - Effort: High

3. **Test-only evidence refresh** — add the missing unit/E2E assertions and refresh expiring dates without changing `handleNext`.
   - Pros: smallest diff and can expose most coverage gaps quickly.
   - Cons: cannot make the required submission capture correct; rollover and payload-date evidence would continue to contradict the specification, so Strict TDD verification would still fail.
   - Effort: Low, but insufficient

### Recommendation

Use Approach 1. First add RED tests that precisely encode the missing evidence, then make the minimal wizard change: retain the validation capture for current-step validation, capture a new boundary immediately before the save/completion call, rerun goal preflight with that boundary, and pass only that boundary's `today` to the existing use case. Add unit cases for a genuinely differing UTC/Madrid instant, DST transition strict-future checks, and calendar rollover. Strengthen E2E assertions to compare `min` and guidance to the same Madrid tomorrow value, assert `aria-invalid="true"`, both help and error IDs in `aria-describedby`, visible `role="alert"`, preserved rejected input, and zero `PUT`; add a deterministic rollover/submission case that proves no stale payload date is sent. Replace fixed dates with durable fixtures, and document evidence as individual scenario claims rather than repeating the original apply-progress overstatement.

This is the smallest slice that can satisfy both behavior and verification: tests alone cannot repair the stale submission boundary, while a broad clock abstraction would add coupling without a demonstrated need. Keep backend files, request types, payload keys, and API behavior unchanged.

### Risks

- Browser clock control can make E2E tests brittle if it depends on native date-input behavior or a global `Date` override; prefer deterministic boundary setup and assertions on observable Madrid dates, with unit tests carrying the pure calendar cases.
- A fresh capture must occur after validation and immediately before the request without allowing duplicate Continue events or losing `saveInFlight` protection.
- A rollover test must distinguish validation-boundary and submission-boundary captures; otherwise it can falsely pass while still sending a stale `validation_date`.
- Replacing expiring fixtures must not silently weaken future-date coverage; fixtures should remain explicitly after the injected/reference date.
- The corrective slice may exceed the default 400-line cognitive threshold even though it is below the configured 800-line budget; split only if the task forecast shows a real review-risk increase, following the cached `ask-on-risk` strategy.
- Verification evidence must report exact passing scenarios and test layers. Do not claim one-clock-per-boundary, rollover, or payload-date coverage unless the corresponding runtime assertion exists.

### Ready for Proposal

Yes. No additional product decision is required before proposal: the existing specification/design already resolves Madrid timezone authority, fresh submission capture, rollover blocking, accessibility semantics, and backend compatibility. The proposal should explicitly scope this as a corrective frontend change with test evidence, list the exact affected files, preserve the request contract, and state that verification-report findings are input evidence rather than an artifact dependency. A technical implementation choice for deterministic Playwright clock control can be settled in design if the existing harness does not support it cleanly.
