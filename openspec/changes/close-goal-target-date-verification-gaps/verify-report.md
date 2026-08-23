```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:42adac051fbc93802b6def82189255cd1f20437f43373caf1b3a551a0ece9f05
verdict: fail
blockers: 1
critical_findings: 1
requirements: 3/4
scenarios: 12/13
test_command: pnpm --filter web exec tsx --test features/onboarding/_domain/goal-target-date.test.ts features/onboarding/_domain/step-validation.test.ts && pnpm test:web-onboarding && pnpm --filter web exec playwright test e2e/onboarding.spec.ts --project=chromium --grep "goal target date exposes|rejects a target that becomes|sends one unchanged-contract" && pnpm --filter web exec playwright test e2e/onboarding.spec.ts --project=chromium
test_exit_code: 0
test_output_hash: sha256:4204e10b89455da73f62d4d941811d6b798c3c20dfebae5833d5702283a33e13
build_command: pnpm lint:web && pnpm build:web
build_exit_code: 0
build_output_hash: sha256:a8c961cb849bbd9f34f2816299255cfc4f929c76b9ecf8976a4393003688fd7f
```

## Verification Report

**Change**: close-goal-target-date-verification-gaps
**Version**: N/A
**Mode**: Strict TDD
**Runtime request**: `verify-close-goal-date-20260822-001`
**Observed authority revision**: `sha256:70fed2915c8a4fca146995464eb09c94dda402a669af3e637d0b1d2c2620c75d` (read-only; not settled or reset)
**Candidate tree at verification start**: `588671c5a153876df65b4121e02d38245ce97f54`

### Completeness

| Metric | Value |
|---|---:|
| Requirements total | 4 |
| Requirements fully compliant | 3 |
| Scenarios total | 13 |
| Scenarios compliant | 12 |
| Tasks total | 7 |
| Tasks complete | 7 |
| Tasks incomplete | 0 |

### Build & Tests Execution

| Check | Exact command | Exit | Exact output SHA-256 | Result |
|---|---|---:|---|---|
| Focused unit + onboarding regression + focused Chromium + full onboarding Chromium | `pnpm --filter web exec tsx --test features/onboarding/_domain/goal-target-date.test.ts features/onboarding/_domain/step-validation.test.ts && pnpm test:web-onboarding && pnpm --filter web exec playwright test e2e/onboarding.spec.ts --project=chromium --grep "goal target date exposes\|rejects a target that becomes\|sends one unchanged-contract" && pnpm --filter web exec playwright test e2e/onboarding.spec.ts --project=chromium` | 0 | `sha256:4204e10b89455da73f62d4d941811d6b798c3c20dfebae5833d5702283a33e13` | ✅ 27 focused unit, 97 onboarding regression, 3 focused Chromium, and 31 full Chromium passed |
| Future-clock durability probe | `pnpm --filter web exec node --import 'data:text/javascript,globalThis.Date%3Dclass%20extends%20Date%7Bconstructor(...args)%7Bsuper(...(args.length%3Fargs%3A%5B%222031-01-01T12%3A00%3A00.000Z%22%5D))%7Dstatic%20now()%7Breturn%20new%20Date(%222031-01-01T12%3A00%3A00.000Z%22).getTime()%7D%7D' --import tsx --test features/onboarding/_domain/wizard-draft.test.ts` | 1 | `sha256:8ea16b95d025e59d1476a2a9049e948676a45e16e24593f5d2f11c22f7e8ce64` | ❌ 5 passed, 3 failed because `completeDraft.goal.target_date` remains fixed at `2026-10-03` while validation reads the ambient Madrid clock |
| Lint + production build/type-check | `pnpm lint:web && pnpm build:web` | 0 | `sha256:a8c961cb849bbd9f34f2816299255cfc4f929c76b9ecf8976a4393003688fd7f` | ✅ ESLint, Next.js production build, and TypeScript passed |

**Coverage**: ➖ Skipped — no coverage command, tool, or threshold is configured in the web package.

### Spec Compliance Matrix

| Requirement | Scenario | Passing runtime evidence | Result |
|---|---|---|---|
| Validate a canonical future Madrid date | Past and today are rejected | `goal-target-date.test.ts > requires a canonical date strictly after Madrid today` | ✅ COMPLIANT |
| Validate a canonical future Madrid date | Tomorrow and later dates pass | Same focused unit test; `step-validation.test.ts > maps invalid and non-future target dates without changing the draft value` | ✅ COMPLIANT |
| Validate a canonical future Madrid date | Malformed or impossible dates are rejected | `goal-target-date.test.ts > rejects malformed, impossible, non-leap, and year-zero values` | ✅ COMPLIANT |
| Validate a canonical future Madrid date | Madrid governs browser-boundary dates | `goal-target-date.test.ts > uses Madrid rather than UTC...` asserts UTC `2030-01-01` versus Madrid `2030-01-02` and strict-future behavior | ✅ COMPLIANT |
| Validate a canonical future Madrid date | DST preserves strict-future semantics | Same unit test asserts extraction and today/tomorrow outcomes immediately before and after both 2030 transitions | ✅ COMPLIANT |
| Provide persistent, accessible correction guidance | Minimum and guidance identify Madrid tomorrow | `onboarding.spec.ts > goal target date exposes...` asserts exact `2030-08-02` minimum and help text under a frozen `2030-08-01` Madrid boundary | ✅ COMPLIANT |
| Provide persistent, accessible correction guidance | Invalid feedback is fully announced | Same Chromium test asserts `aria-invalid`, exact help+error `aria-describedby`, and error `role="alert"` text | ✅ COMPLIANT |
| Provide persistent, accessible correction guidance | Rejected values are preserved | Same Chromium test asserts the entered rejected value remains unchanged | ✅ COMPLIANT |
| Gate progression without changing the request contract | Midnight rollover blocks a formerly valid value | `onboarding.spec.ts > rejects a target that becomes Madrid today...` queues captures across Madrid midnight, preserves the value, shows the error, and asserts zero PUTs | ✅ COMPLIANT |
| Gate progression without changing the request contract | Valid flow remains unchanged | `onboarding.spec.ts > sends one unchanged-contract PUT...` asserts one request, exact keys `snapshot` and `validation_date`, and fresh `validation_date: 2030-08-01` | ✅ COMPLIANT |
| Gate progression without changing the request contract | Client rejection prevents a request | UI rejection and rollover Chromium tests both assert zero PUTs | ✅ COMPLIANT |
| Maintain durable verification evidence | Evidence matches executable coverage | This matrix cites only tests that executed in the recorded unit/Chromium commands; the uncovered durability scenario is not claimed | ✅ COMPLIANT |
| Maintain durable verification evidence | Fixtures remain non-expiring | Future-clock probe fails three `wizard-draft.test.ts` cases after the fixed `2026-10-03` target expires | ❌ FAILING |

**Compliance summary**: 12/13 scenarios compliant. The durability requirement is incomplete.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|---|---|---|
| Validate a canonical future Madrid date | ✅ Implemented | Feature-local Gregorian parsing and `Europe/Madrid` extraction are retained; deterministic UTC disagreement and both DST transitions pass. |
| Provide persistent, accessible correction guidance | ✅ Implemented | `GoalStep` binds exact tomorrow, persistent guidance, controlled value, invalid state, help/error associations, and alert semantics. |
| Gate progression without changing the request contract | ✅ Implemented | `handleNext` captures `submissionBoundary` after clearing, revalidates Goal, blocks before the use case, and passes `submissionBoundary.today`; runtime body keys remain exact. |
| Maintain durable verification evidence | ❌ Incomplete | `apps/web/features/onboarding/_domain/wizard-draft.test.ts:46` still uses `2026-10-03`; `firstIncompleteStepIndex` calls `validateStep` without an explicit boundary, which reaches the ambient Madrid clock. |

### Coherence (Design)

| Decision | Followed? | Notes |
|---|---|---|
| Separate validation and submission captures | ✅ Yes | Distinct `boundary` and `submissionBoundary` are used, with no async gap before invoking save/complete. |
| Existing clock seam plus spec-local Playwright harness | ✅ Yes | No production clock service/global hook was added; the Date queue is opt-in in the E2E spec. |
| Explicit reference-boundary fixtures | ❌ No | Corrective focused fixtures are explicit, but the ambient-clock `wizard-draft.test.ts` complete fixture remains fixed in 2026 and demonstrably expires. |
| Frontend-only, unchanged request body | ✅ Yes | No backend/request-shape path changed in the corrective batch; browser runtime asserts exact `{ snapshot, validation_date }` keys. |

### Historical Blocker Closure

| Previous blocker | Current evidence |
|---|---|
| Madrid/UTC disagreement untested | ✅ Closed by a differing UTC/Madrid instant plus strict-future assertions |
| DST strict-future behavior partial | ✅ Closed before/after both March and October transitions |
| Tomorrow minimum/guidance partial | ✅ Closed with exact minimum and guidance date |
| Accessibility association partial | ✅ Closed with invalid state, both description IDs, and alert semantics |
| Midnight recapture missing/untested | ✅ Closed in source and deterministic zero-PUT Chromium evidence |
| Strict-TDD claims overstated | ✅ Historical six claims now have executable evidence; a new, separate durable-fixture contradiction is reported rather than hidden |

### TDD Compliance

| Check | Result | Details |
|---|---|---|
| TDD Evidence reported | ✅ | `sdd/.../apply-progress` contains the required TDD Cycle Evidence table. |
| All tasks have tests/check evidence | ✅ | 7/7 task rows name test, quality, or process evidence. |
| RED confirmed (tests exist) | ✅ | Both domain test files and the Playwright test file exist; task 2.2 records the pre-production failing rollover assertion. |
| GREEN confirmed (tests pass) | ✅ | All change-focused unit and Chromium tests pass in current execution. |
| Triangulation adequate | ❌ | 12/13 scenarios are proven; future-clock durability fails. |
| Safety Net for modified files | ⚠️ | Domain tests record 27/27; the modified E2E file cites a parent pre-change pass precondition without an exact pre-RED test count/hash. |

**TDD Compliance**: 4/6 checks passed.

### Test Layer Distribution

| Layer | Change-focused tests executed | Files | Tools |
|---|---:|---:|---|
| Unit | 27 | 2 | Node test runner through `tsx` |
| Integration | 0 | 0 | Not used |
| E2E | 3 | 1 | Playwright Chromium |
| **Total** | **30** | **3** | |

### Changed File Coverage

Coverage analysis skipped — no coverage tool detected.

### Assertion Quality

**Assertion quality**: ✅ All assertions in the three created/modified change-related test files execute production behavior or rendered browser behavior. No tautologies, ghost loops, orphan type-only checks, smoke-only assertions, CSS implementation-detail checks, or mock-heavy files were found.

### Quality Metrics

**Linter**: ✅ No errors or warnings
**Type Checker / Build**: ✅ No errors
**Coverage**: ➖ Not available

### Generated File Mutation

Playwright's Next dev server transiently normalized `apps/web/next-env.d.ts`: it was clean before test execution, had SHA-256 `7ad303e40d4fddf44f156129e397511953a71481c5cfd86b1862649aaaf240cc` and appeared modified after tests, then `pnpm build:web` restored the tracked content at SHA-256 `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`. The final diff is empty. `apps/web/tsconfig.json` remained unchanged at SHA-256 `fc667bb79ffd49fd38ccd3e3ea9ba1f4a617fb6157a545bcf89600efdb2ac8eb`.

### Canonical Verification Evidence Bytes

The following fenced content is the exact verification-evidence preimage. Its SHA-256 digest is `sha256:42adac051fbc93802b6def82189255cd1f20437f43373caf1b3a551a0ece9f05`.

```yaml
schema: gentle-ai.verification-evidence-preimage/v1
change: close-goal-target-date-verification-gaps
mode: strict-tdd
runtime_request: verify-close-goal-date-20260822-001
observed_authority_revision: sha256:70fed2915c8a4fca146995464eb09c94dda402a669af3e637d0b1d2c2620c75d
candidate_tree: 588671c5a153876df65b4121e02d38245ce97f54
requirements_complete: 3/4
scenarios_compliant: 12/13
test_command: pnpm --filter web exec tsx --test features/onboarding/_domain/goal-target-date.test.ts features/onboarding/_domain/step-validation.test.ts && pnpm test:web-onboarding && pnpm --filter web exec playwright test e2e/onboarding.spec.ts --project=chromium --grep "goal target date exposes|rejects a target that becomes|sends one unchanged-contract" && pnpm --filter web exec playwright test e2e/onboarding.spec.ts --project=chromium
test_exit_code: 0
test_output_hash: sha256:4204e10b89455da73f62d4d941811d6b798c3c20dfebae5833d5702283a33e13
supplementary_test_command: pnpm --filter web exec node --import 'data:text/javascript,globalThis.Date%3Dclass%20extends%20Date%7Bconstructor(...args)%7Bsuper(...(args.length%3Fargs%3A%5B%222031-01-01T12%3A00%3A00.000Z%22%5D))%7Dstatic%20now()%7Breturn%20new%20Date(%222031-01-01T12%3A00%3A00.000Z%22).getTime()%7D%7D' --import tsx --test features/onboarding/_domain/wizard-draft.test.ts
supplementary_test_exit_code: 1
supplementary_test_output_hash: sha256:8ea16b95d025e59d1476a2a9049e948676a45e16e24593f5d2f11c22f7e8ce64
build_command: pnpm lint:web && pnpm build:web
build_exit_code: 0
build_output_hash: sha256:a8c961cb849bbd9f34f2816299255cfc4f929c76b9ecf8976a4393003688fd7f
verdict: fail
blockers: 1
critical_findings: 1
warning_findings: 1
suggestion_findings: 0
```

### Native Attempt Finish Inputs

- **Evidence revision**: `sha256:42adac051fbc93802b6def82189255cd1f20437f43373caf1b3a551a0ece9f05`
- **Diagnosis**: An ambient-clock onboarding test fixture still fixes `goal.target_date` at `2026-10-03`; after expiry, Goal validation makes `firstIncompleteStepIndex` return step 0 and breaks three navigation tests.
- **Harness disposition**: `reused` — the existing Node/tsx and Playwright harnesses are valid; the independent future-clock preload exposed the defect without changing repository code.
- **Cleanup evidence**: No production/test code, staging, commit, push, PR, attempt settlement, or reset was performed. The transient `next-env.d.ts` normalization was restored by the production build; final generated-file diff is empty; `git diff --check` passes.
- **Process evidence**: Primary suites passed (27 focused unit, 97 onboarding regression, 3 focused Chromium, 31 full Chromium), lint/build passed, and the independent 2031 ambient-clock probe failed 3/8 tests with exact output hash `sha256:8ea16b95d025e59d1476a2a9049e948676a45e16e24593f5d2f11c22f7e8ce64`.

### Issues Found

**CRITICAL (1)**

1. `apps/web/features/onboarding/_domain/wizard-draft.test.ts:46` retains fixed target `2026-10-03`, while `firstIncompleteStepIndex` invokes ambient-clock Goal validation. The independent 2031 probe fails three tests, so the required non-expiring-fixture scenario is not compliant and the apply evidence's broad durable-fixture completion claim is false.

**WARNING (1)**

1. The Strict-TDD Safety Net entry for the modified Playwright file cites a parent pre-change suite-pass precondition but does not preserve an exact pre-RED test count or output hash.

**SUGGESTION (0)**: None.

### Verdict

**FAIL**

The six historical verification gaps are closed and all normal suites, lint, and build pass, but the new durable-evidence requirement is contradicted by a reproducible ambient-clock failure after the remaining fixed 2026 fixture expires. Archive must remain blocked.

### Non-Retroactive Follow-Up

This report remains the historical FAIL record and its original claims are unchanged. The later archived PASS report at `../archive/2026-08-22-stabilize-wizard-draft-goal-date-fixture/verify-report.md` records evidence revision `sha256:53308efeb08959912f6d2412b6719293a0f2e8a7cb9ec94cf1c3b634c58ee305`. The current follow-up additionally strengthens the valid-flow browser proof with an explicit PUT-method assertion and the second Madrid capture date; it does not retroactively alter this verdict or its evidence.
