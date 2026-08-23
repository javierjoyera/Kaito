```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:e057bb7783bc0f47b01ab36118ba6d61d3d5aa622e32d49cb8118dbb3547c12e
verdict: fail
blockers: 6
critical_findings: 6
requirements: 0/3
scenarios: 6/11
test_command: pnpm --filter web exec tsx --test features/onboarding/_domain/goal-target-date.test.ts features/onboarding/_domain/step-validation.test.ts && pnpm test:web-onboarding && pnpm --filter web exec playwright test e2e/onboarding.spec.ts --grep "goal target date"
test_exit_code: 0
test_output_hash: sha256:d2b5c5750a12e3a680279f71de9812fec9036dae8a58758f46f33f4325f55448
build_command: pnpm lint:web && pnpm build:web
build_exit_code: 0
build_output_hash: sha256:ea0174ce14cd6f1c7e721cae1e5f02c5feac64148c7bb335a70775ce9e181739
```

## Verification Report

**Change**: validate-goal-target-date
**Version**: N/A
**Mode**: Strict TDD
**Authority**: lineage `review-5e4e6bb7f263c870`; candidate tree `c0073b620e428f8a6ec9615b0b42e2589d260f5a`; SDD binding `sha256:303705e21941b5de6a4a29be27aa019e7027bb74e76123f3473049d76944a10a`; post-apply gate `allow`

### Completeness

| Metric | Value |
|---|---:|
| Requirements total | 3 |
| Requirements fully compliant | 0 |
| Scenarios total | 11 |
| Scenarios compliant | 6 |
| Tasks total | 9 |
| Tasks complete | 9 |
| Tasks incomplete | 0 |

### Build & Tests Execution

| Check | Exact command | Exit | Exact output SHA-256 | Result |
|---|---|---:|---|---|
| Focused unit + onboarding regression + focused Chromium E2E | `pnpm --filter web exec tsx --test features/onboarding/_domain/goal-target-date.test.ts features/onboarding/_domain/step-validation.test.ts && pnpm test:web-onboarding && pnpm --filter web exec playwright test e2e/onboarding.spec.ts --grep "goal target date"` | 0 | `sha256:d2b5c5750a12e3a680279f71de9812fec9036dae8a58758f46f33f4325f55448` | ✅ 27 focused unit, 97 onboarding regression, and 1 Chromium E2E passed |
| Supplementary valid-flow Chromium E2E | `pnpm --filter web exec playwright test e2e/onboarding.spec.ts --grep "goal target date\|shows step 2 for Trail\|blocks missing status"` | 0 | `sha256:50a2a764a43a0658e8e7aa640010bb320ed2d879ec4ba7d415bc6b45c3d92cb0` | ✅ 3 passed |
| Lint + production build/type-check | `pnpm lint:web && pnpm build:web` | 0 | `sha256:ea0174ce14cd6f1c7e721cae1e5f02c5feac64148c7bb335a70775ce9e181739` | ✅ ESLint, Next.js build, and TypeScript passed |

**Coverage**: ➖ Skipped — repository capabilities declare no coverage tool or threshold.

### Spec Compliance Matrix

| Requirement | Scenario | Passing runtime evidence | Result |
|---|---|---|---|
| Validate a canonical future Madrid date | Past and today are rejected | `goal-target-date.test.ts > requires a canonical date strictly after Madrid today` | ✅ COMPLIANT |
| Validate a canonical future Madrid date | Tomorrow and later dates pass | `goal-target-date.test.ts > requires a canonical date strictly after Madrid today`; `step-validation.test.ts > maps invalid and non-future target dates without changing the draft value` | ✅ COMPLIANT |
| Validate a canonical future Madrid date | Malformed or impossible dates are rejected | `goal-target-date.test.ts > rejects malformed, impossible, non-leap, and year-zero values` | ✅ COMPLIANT |
| Validate a canonical future Madrid date | Madrid governs browser-boundary dates | No test uses an instant where Madrid and the browser/UTC calendar dates differ; the asserted `2026-08-01T00:30:00Z` is August 1 in both UTC and Madrid | ❌ UNTESTED |
| Validate a canonical future Madrid date | DST does not alter date semantics | `goal-target-date.test.ts > extracts Madrid dates across browser, midnight, and DST boundaries` verifies extraction near one transition, but does not assert strict-future validation at the transition | ⚠️ PARTIAL |
| Provide persistent, accessible correction guidance | Minimum and guidance identify the earliest valid date | Focused E2E checks only that `min` matches a date-shaped regex; it does not prove `min === Madrid tomorrow` or that guidance contains that exact date | ⚠️ PARTIAL |
| Provide persistent, accessible correction guidance | Guidance and errors are announced through the field | Focused E2E proves help association and visible error text, but does not prove the invalid-state association includes the error, `aria-invalid`, and alert behavior together | ⚠️ PARTIAL |
| Provide persistent, accessible correction guidance | Rejected values are preserved | `onboarding.spec.ts > goal target date exposes Madrid guidance and preserves a rejected value without a PUT` | ✅ COMPLIANT |
| Gate progression without changing the request contract | Midnight rollover blocks a formerly valid value | No runtime test advances the clock across Madrid midnight. Source captures one boundary before validation and reuses it for submission instead of recapturing immediately before PUT | ❌ UNTESTED |
| Gate progression without changing the request contract | Valid flow remains unchanged | Supplementary Chromium tests advance through step 1 and complete onboarding; onboarding unit tests pass the existing snapshot and validation-date contract | ✅ COMPLIANT |
| Gate progression without changing the request contract | Client rejection prevents a request | `onboarding.spec.ts > goal target date exposes Madrid guidance and preserves a rejected value without a PUT` | ✅ COMPLIANT |

**Compliance summary**: 6/11 scenarios compliant; 3 partial; 2 untested. No requirement is fully compliant because each requirement contains at least one partial or untested scenario.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|---|---|---|
| Validate a canonical future Madrid date | ⚠️ Partially implemented | Feature-local parsing rejects non-canonical/nonexistent dates and uses `Intl.DateTimeFormat` with `Europe/Madrid`; direct runtime proof is incomplete for browser-date disagreement and full DST semantics. |
| Provide persistent, accessible correction guidance | ⚠️ Partially verified | Source provides `min`, persistent help, controlled-value preservation, conditional error association, `aria-invalid`, and `role="alert"`; runtime assertions do not cover the complete contract. |
| Gate progression without changing the request contract | ❌ Not fully implemented | `handleNext` captures at line 298, validates at lines 315/318, and reuses the same `boundary.today` for PUT at lines 331–333. It does not perform the design-required fresh submission capture immediately before PUT. |

### Coherence (Design)

| Decision | Followed? | Notes |
|---|---|---|
| Feature-local onboarding domain module | ✅ Yes | `goal-target-date.ts` remains within onboarding. |
| Explicit Gregorian date-only operations | ✅ Yes | No `Date.parse` or local date getters are used. |
| One immutable capture per distinct validation and submission boundary | ❌ No | One capture is reused across both boundaries in `handleNext`; design lines 5, 13, and 25 require a fresh pre-PUT capture. |
| Goal preflight before every PUT | ⚠️ Partial | Goal validation runs before PUT, but it uses the earlier validation capture rather than a newly captured submission boundary. |
| Controlled value, minimum, guidance, and accessible feedback | ✅ Yes | Source follows the designed prop flow and field associations. |
| Existing backend request contract | ✅ Yes | No backend or request-shape changes were found; existing save/completion use cases remain in use. |

### TDD Compliance

| Check | Result | Details |
|---|---|---|
| TDD evidence reported | ✅ | A TDD Cycle Evidence table exists in `apply-progress.md`. |
| All tasks have test/check evidence | ✅ | 9/9 task rows cite focused tests, regression/E2E, or quality checks. |
| RED confirmed | ⚠️ | Three related test files exist, but historical RED states cannot be independently replayed and the table does not use the required explicit `✅ Written` form. |
| GREEN confirmed | ✅ | All three related test files passed in current execution. |
| Triangulation adequate | ❌ | Only 6/11 required scenarios have complete passing runtime coverage. |
| Safety net for modified files | ⚠️ | The required Safety Net column is absent; no pre-change pass count is recorded for the two modified test files. |

**TDD Compliance**: 3/6 checks passed. The apply report's claims for atomic rollover, clock-boundary, and payload-date coverage are not backed by tests present in the changed files.

### Test Layer Distribution

| Layer | Change-focused tests executed | Files | Tools |
|---|---:|---:|---|
| Unit | 4 | 2 | Node.js test runner via `tsx` |
| Integration | 0 | 0 | No component integration harness used for this change |
| E2E | 3 | 1 | Playwright Chromium; one directly added goal-date test plus two supplementary valid-flow tests |
| **Total** | **7** | **3** | |

### Changed File Coverage

Coverage analysis skipped — no coverage tool detected.

### Assertion Quality

**Assertion quality**: ✅ All assertions in the created/modified change-related tests call production behavior or exercise rendered browser behavior. No tautologies, ghost loops, orphan type-only checks, smoke-only assertions, CSS implementation-detail checks, or mock-heavy files were found.

### Quality Metrics

**Linter**: ✅ No errors or warnings
**Type Checker / Build**: ✅ No errors
**Coverage**: ➖ Not available

### Canonical Verification Evidence Bytes

The following fenced content is the exact verification-evidence preimage. Its SHA-256 digest is `sha256:e057bb7783bc0f47b01ab36118ba6d61d3d5aa622e32d49cb8118dbb3547c12e`.

```yaml
schema: gentle-ai.verification-evidence-preimage/v1
change: validate-goal-target-date
mode: strict-tdd
approved_lineage: review-5e4e6bb7f263c870
receipt_hash: sha256:d6d439b279d178ebaf10ebcd383b8273d0bbb7728e90b3a14c621a7b078e96f7
candidate_tree: c0073b620e428f8a6ec9615b0b42e2589d260f5a
sdd_binding_revision: sha256:303705e21941b5de6a4a29be27aa019e7027bb74e76123f3473049d76944a10a
post_apply_gate: allow
requirements_complete: 0/3
scenarios_compliant: 6/11
test_command: pnpm --filter web exec tsx --test features/onboarding/_domain/goal-target-date.test.ts features/onboarding/_domain/step-validation.test.ts && pnpm test:web-onboarding && pnpm --filter web exec playwright test e2e/onboarding.spec.ts --grep "goal target date"
test_exit_code: 0
test_output_hash: sha256:d2b5c5750a12e3a680279f71de9812fec9036dae8a58758f46f33f4325f55448
supplementary_test_command: pnpm --filter web exec playwright test e2e/onboarding.spec.ts --grep "goal target date|shows step 2 for Trail|blocks missing status"
supplementary_test_exit_code: 0
supplementary_test_output_hash: sha256:50a2a764a43a0658e8e7aa640010bb320ed2d879ec4ba7d415bc6b45c3d92cb0
build_command: pnpm lint:web && pnpm build:web
build_exit_code: 0
build_output_hash: sha256:ea0174ce14cd6f1c7e721cae1e5f02c5feac64148c7bb335a70775ce9e181739
verdict: fail
blockers: 6
critical_findings: 6
warning_findings: 2
suggestion_findings: 0
```

### Issues Found

**CRITICAL (6)**

1. The browser-boundary scenario has no covering runtime test: the test instant does not produce different Madrid and UTC/browser dates.
2. The DST scenario is only partially covered: date extraction is asserted, but strict-future behavior at the transition is not.
3. The minimum/guidance scenario is only partially covered: E2E accepts any date-shaped `min` rather than proving exact Madrid tomorrow and matching guidance.
4. The accessible-announcement scenario is only partially covered: the invalid-state help+error association, `aria-invalid`, and alert semantics are not asserted as one behavior.
5. Midnight rollover is untested and the source does not recapture Madrid time at the distinct submission boundary immediately before PUT, contrary to the specification and design.
6. Strict-TDD evidence overstates coverage: `apply-progress.md` claims one-clock-per-boundary, rollover blocking, and payload-date tests that are not present in the related unit/E2E files.

**WARNING (2)**

1. Fixed future-date fixtures expire in October/December 2026: `2026-10-03` in E2E and `2026-12-01` in unit tests will become today/past and make unrelated flows fail.
2. The TDD Cycle Evidence table omits the required Safety Net column and therefore does not establish pre-change regression status for modified test files.

**SUGGESTION (0)**: None.

### Verdict

**FAIL**

All executed tests, lint, and build checks pass, but Strict TDD verification cannot mark required scenarios compliant without complete passing runtime coverage. The missing fresh submission-boundary capture is also a substantive specification/design deviation. Archive must remain blocked.
