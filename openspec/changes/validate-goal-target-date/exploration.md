## Exploration: validate-goal-target-date

### Current State
The onboarding route renders `OnboardingExperience`, which starts `OnboardingWizard`. The wizard currently computes `today` with browser-local `getFullYear()`/`getMonth()`/`getDate()` once at mount, uses that value both to load the draft and to submit `validation_date`, and controls the draft state. `GoalStep` renders a controlled `input type="date"`; its value is preserved in the wizard draft, but it has no `min` or guidance text. `validateGoalStep` currently checks only required presence and a `YYYY-MM-DD` shape, so past, today, and impossible calendar dates can pass the client boundary. `handleNext` runs `validateStep` before calling either `saveOnboardingStep` or `completeOnboarding`, which serialize the snapshot and `validation_date` through `onboarding-api.ts`.

The backend remains the authoritative submission boundary. `SaveOnboardingRequest` parses `validation_date` as a Python `date`; `parse_and_normalize` calls `_add_goal_diagnostics`; `TargetDate.parse` strictly accepts canonical ISO dates and rejects impossible dates; `TargetDate.is_after` enforces strict comparison. A completed snapshot with a non-future target is demoted to incomplete and returns `target_date_not_future`. Existing backend tests cover canonical parsing and explicit validation-date demotion. The current mismatch is that the browser supplies a browser-local validation date while the product contract is `Europe/Madrid`.

There is no CodeGraph index in the repository and the governing MCP instructions explicitly reserve initialization for the user. Structural exploration therefore used targeted filesystem/code searches after recording the fallback. Existing code provides a tested `Intl.DateTimeFormat(..., { timeZone: "Europe/Madrid" }).formatToParts()` pattern in `productRouteValidationDate`; planning has the same calendar-date convention. The onboarding test runner is deterministic Node.js via `tsx`.

### Affected Areas
- `apps/web/features/onboarding/_components/onboarding-wizard.tsx` — currently owns browser-local “today”, supplies `validation_date`, and gates submission through `validateStep`.
- `apps/web/features/onboarding/_domain/step-validation.ts` — current goal validation boundary; it needs strict calendar validity and a strictly-future comparison contract without mutating the draft.
- `apps/web/features/onboarding/_domain/step-validation.test.ts` — cheapest behavior-first boundary for past/today/tomorrow, malformed dates, and injected deterministic “today”.
- `apps/web/features/onboarding/_components/goal-step.tsx` — date input needs the tomorrow minimum and persistent guidance joined with existing error `aria-describedby`; controlled value preservation already exists.
- `apps/web/features/onboarding/_components/field-messages.ts` — only affected if the implementation introduces a distinct error code/message rather than reusing `invalid_type`/`out_of_range`.
- `apps/web/features/onboarding/_adapters/onboarding-api.ts`, `_use-cases/save-onboarding-step.ts`, `_use-cases/complete-onboarding.ts` — submission path to preserve; no API contract change is required.
- `apps/api/app/modules/runner_profile/domain.py`, `validation.py`, and `tests/runner_profile/{test_domain.py,test_use_cases.py}` — authoritative backend contract and regression evidence; expected to remain unchanged for this issue.
- `apps/web/e2e/onboarding.spec.ts` — optional focused browser assertion for `min`, guidance association, and no submission when a rejected value is selected; existing tests are the closest accessibility/integration convention.
- `apps/web/features/product-routing/_adapters/product-route-api.ts` — reference only: its Madrid date extraction is an existing pattern, not a reason to create a generic cross-feature utility.

### Approaches
1. **Onboarding-owned date-only contract with injected clock** — derive the canonical Madrid calendar date from an instant using `Intl.DateTimeFormat`/`formatToParts`, validate the exact ISO string with a calendar round-trip, and compare date-only ISO values (or an equivalent ordinal) rather than timestamps. Pass the deterministic reference date into the pure goal validator; use the same canonical date for the wizard request and input minimum.
   - Pros: behavior-first and deterministic; handles UTC/Madrid midnight boundaries and DST without local-browser dependence; rejects impossible dates; keeps date-only semantics explicit; small feature-local blast radius.
   - Cons: the Madrid extraction pattern may remain duplicated across capabilities; exact error-code/message choice must be settled during proposal/spec.
   - Effort: Medium

2. **Reuse `productRouteValidationDate` directly** — import the existing product-routing adapter as the source of the Madrid date.
   - Pros: avoids a second formatter implementation and immediately matches an existing tested convention.
   - Cons: creates onboarding-to-product-routing coupling across feature ownership; the function lives in an adapter with unrelated route concerns; does not by itself solve strict calendar validation or injection. This conflicts with the repository’s feature ownership and anti-generic-abstraction constraints.
   - Effort: Low initially, Medium maintenance risk

3. **Use `Date` parsing/local midnight or browser-local calendar getters** — compare parsed timestamps or the browser’s local date.
   - Pros: shortest implementation and familiar APIs.
   - Cons: rejected. Date-only strings and local midnight introduce host-timezone shifts; browser-local getters disagree with Madrid around UTC boundaries; DST/midnight behavior becomes implicit; permissive normalization can accept impossible calendar dates.
   - Effort: Low code, High correctness risk

4. **Move the rule/date source to the backend** — have the server derive Madrid “today” and change the request contract.
   - Pros: strongest authority and no client clock trust.
   - Cons: rejected for issue #119 because backend rule/contract changes are an explicit non-goal; it would expand API, integration-test, and rollout scope. The existing backend check must remain authoritative as a defense-in-depth boundary.
   - Effort: High

### Recommendation
Keep the change frontend-focused while preserving the existing backend validator unchanged. Add a small onboarding-owned, pure date-only contract with an injected instant/reference date: extract the `Europe/Madrid` calendar date using the existing `Intl` pattern, reject non-canonical and impossible dates by round-trip validation, then require `target_date > madridToday`. Wire the wizard’s canonical date into validation and submission, set the date input’s `min` to tomorrow, and add persistent human guidance. Preserve the controlled draft value and use the existing `aria-invalid`/inline `role="alert"` pattern, extending `aria-describedby` to include guidance and the error when present.

Strict TDD should start with the narrowest domain tests: RED for past, today, tomorrow, malformed shape, impossible dates, and the UTC-to-Madrid boundary; GREEN with the smallest contract; then triangulate with DST transition instants and the wizard/API submission date; refactor only after the focused suite passes. Run `pnpm --filter web test:onboarding`, then `pnpm lint:web`; retain backend regression evidence with `cd apps/api && uv run pytest tests/runner_profile/test_domain.py tests/runner_profile/test_use_cases.py`. A small Playwright addition is justified only if the native `min`/accessible guidance contract cannot be proved at the domain boundary.

Expected implementation blast radius is limited to onboarding validation, the goal-date field, and the wizard’s date source, with no persistence, semantic, route, logout, or backend-rule changes. Forecast: approximately 80–180 authored changed lines including focused tests and SDD text, therefore below the 800-line review budget and not a chained-PR candidate.

### Risks
- The current backend accepts a client-supplied `validation_date`; with no backend change, frontend and backend must agree that this value is the canonical Madrid date. A later security/authority decision may require a separate backend issue, but it is outside this change.
- Reusing one error code for invalid calendar dates versus past/today dates may make feedback less precise; the proposal/spec should decide whether a new frontend-only code is warranted.
- A wizard mounted before midnight can retain a stale captured date. The implementation should define whether the validation-date snapshot is per wizard mount or refreshed per validation/submission; do not silently mix dates in one request.
- Native date-input rendering differs by browser. The `min` attribute is useful guidance, but deterministic tests should assert the date contract and accessibility associations rather than visual picker behavior.

### Ready for Proposal
Yes. The code path, authoritative backend boundary, existing accessibility conventions, Madrid timezone pattern, focused test commands, and bounded frontend-only recommendation are clear. The proposal should explicitly record the client-supplied canonical `validation_date` assumption and choose the frontend error-code/message contract before specification.
