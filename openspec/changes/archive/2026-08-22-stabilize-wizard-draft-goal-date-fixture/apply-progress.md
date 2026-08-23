# Apply Progress: Stabilize Wizard Draft Goal-Date Fixture

**Status**: Complete — 6/6 tasks are marked `[x]` in both hybrid task artifacts. The maintainer-authorized deterministic RED criterion replaces the nondeterministic raw TAP-output hash criterion.

**Mode**: Strict TDD

**Delivery**: One tiny PR; 1-line implementation scope.

**Scope-boundary correction**: The former `APPLY_BASELINE=545782c7cee82ed79604dd111fd99fdb24b5398e` claim is superseded only for scope attribution. That temporary baseline omitted the pre-existing untracked `goal-target-date.ts` and `goal-target-date.test.ts` files, so comparing against it falsely attributed those files to this minimal fixture change. No implementation, test, prior artifact, review authority, or verification evidence was changed by this correction.

**Evidence revision**: `apply-stable-wizard-fixture-scope-remediation-20260822-005`

**Evidence SHA-256**: `sha256:4975962ac77c2cbc3f8d8256573158ac5b902a6516a5720aa2b0b0273ba813b2` (canonical scope-remediation manifest below; it binds to failed verification evidence `sha256:2fae9409490d76938af2e8be7ab18ba9ad27475473bcb9ba760cd72a039c6c3c`).

## Completed Tasks

- [x] 1.1 Preserve the pre-edit 2031 RED with maintainer-authorized deterministic evidence: exit `1`, 5 passing tests, 3 failing tests, and the three named navigation failures.
- [x] 2.1 Replace only `completeDraft.goal.target_date` with `2099-10-03`.
- [x] 3.1 Focused wizard-draft suite passes with unchanged navigation assertions.
- [x] 3.2 Exact 2031-clock probe and onboarding regression pass.
- [x] 3.3 Corrected scope evidence proves native attempt ordinal 1 changed exactly two lines and the current fixture-file diff is only the required literal replacement; the two goal-target-date files are pre-existing work outside this change.
- [x] 3.4 Persist hybrid task evidence and confirm no implementation file beyond the fixture changed.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 1.1 | `wizard-draft.test.ts` | Unit | N/A — this is the required pre-edit RED | ✅ Deterministic evidence preserved: exit 1, 5 pass, 3 fail; `selects the first locally incomplete executable step`, `selects the first step with a server diagnostic even when locally valid`, and `falls back to the final executable step when the draft is complete` failed | N/A — evidence-only task | N/A — one preserved fixture scenario | None needed |
| 2.1 | `wizard-draft.test.ts` | Unit | Focused suite before edit: exit 0, 8/8 pass | Preserved 2031 failure demonstrated the expiring fixture before the edit | Focused suite and exact 2031 probe: exit 0, 8/8 pass each | Existing three navigation consumers cover locally incomplete, diagnostic, and complete paths; no assertion change permitted | None needed — one literal replacement |
| 3.1 | `wizard-draft.test.ts` | Unit | Covered by task 2.1 safety net | N/A — execution-only acceptance task | Exit 0, 8/8 pass | Existing three navigation scenarios | None needed |
| 3.2 | `wizard-draft.test.ts` / onboarding suite | Unit | Covered by task 2.1 safety net | N/A — execution-only acceptance task | 2031 probe exit 0, 8/8; onboarding exit 0, 97/97 | Focused and broader onboarding paths | None needed |
| 3.3 | Native attempt ledger + Git diff | Scope | N/A — evidence-only task | N/A — no behavior change | Native attempt 1: 2 changed lines; current zero-context fixture diff: one literal replacement, 1 addition/1 deletion | N/A — exact one-line scope; goal-target-date files classified pre-existing/outside scope | None needed |
| 3.4 | Hybrid artifacts | Persistence | N/A — evidence-only task | N/A — no behavior change | OpenSpec tasks updated and Engram task artifact updated | N/A — one persistence target per backend | None needed |

## Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused test | Not rerun by this artifact-only remediation; prior verified result retained: `pnpm --filter web exec tsx --test features/onboarding/_domain/wizard-draft.test.ts` → exit 0; 8 tests passed, 0 failed. |
| Runtime harness | N/A — test-fixture-only change; no runtime boundary or production behavior was modified. |
| Regression harness | Not rerun by this artifact-only remediation; prior verified result retained: `pnpm test:web-onboarding` → exit 0; 97 tests passed, 0 failed. |
| 2031 harness | Not rerun by this artifact-only remediation; prior verified result retained: exact Date preload command → exit 0; 8 tests passed, 0 failed. |
| Rollback boundary | Revert only the scope-claim wording in this apply-progress artifact and paired tasks artifact; implementation rollback remains only `apps/web/features/onboarding/_domain/wizard-draft.test.ts:46` from `2099-10-03` to `2026-10-03`. |

## Corrected Scope Evidence

The earlier claim based on `APPLY_BASELINE=545782c7cee82ed79604dd111fd99fdb24b5398e` is withdrawn solely because that detached baseline omitted two pre-existing untracked files. It must not be used to attribute `apps/web/features/onboarding/_domain/goal-target-date.ts` or `apps/web/features/onboarding/_domain/goal-target-date.test.ts` to this change.

Reliable boundary evidence is the native runtime ledger for attempt ordinal 1: it recorded exactly **2 changed lines** between begin candidate `sha256:5eec61079fc72f7166ac64265f1ef2d7fbcf7c2d5e83d60d5b895f67bc6aa0b2` / tree `588671c5a153876df65b4121e02d38245ce97f54` and finish candidate `sha256:dc21f9a18fce67eb1780e0d3088d2bd27bdfd725e602eba508c9b3fc843de670` / tree `0c2440c868d83d306e2a29f3b71a781c2becc5d9`.

The read-only current check `git diff --unified=0 -- apps/web/features/onboarding/_domain/wizard-draft.test.ts` reports 1 addition and 1 deletion; its only hunk is `2026-10-03` → `2099-10-03` at `completeDraft.goal.target_date`, with no assertion hunk. Current literal-diff SHA-256: `sha256:d67f70f5be31e74ec236ad2f6b8bf6b435b40bde9ab87d73638ba47c2cd52d7d`.

Classification: `apps/web/features/onboarding/_domain/goal-target-date.ts` and `apps/web/features/onboarding/_domain/goal-target-date.test.ts` are pre-existing work outside this minimal fixture change, not new implementation scope. Their presence in the old baseline comparison is a boundary artifact, not scope expansion.

## Diagnosis

The preserved pre-edit RED is deterministically evidenced by its behavior: exit `1`, 5 passing tests, 3 failing tests, and the three specified navigation failures. The historical raw TAP SHA-256 is intentionally not reproduced: Node TAP includes variable duration values (and may vary in location/output formatting), so a raw-output hash is nondeterministic. The maintainer authorized this behavioral criterion; no source change should be made to stabilize a test-runner transcript.

## Current GREEN Evidence

| Command | Exact result |
|---|---|
| `pnpm --filter web exec tsx --test features/onboarding/_domain/wizard-draft.test.ts` | Prior evidence retained: exit `0`; 8/8 passed, 0 failed. Not rerun by this artifact-only remediation. |
| Exact documented 2031 Date-preload probe | Prior evidence retained: exit `0`; 8/8 passed, 0 failed. Not rerun by this artifact-only remediation. |
| `pnpm test:web-onboarding` | Prior evidence retained: exit `0`; 97/97 passed, 0 failed. Not rerun by this artifact-only remediation. |
| Read-only corrected scope check | Native attempt ordinal 1 recorded 2 changed lines; current fixture diff is 1 addition/1 deletion and only `2026-10-03` → `2099-10-03`, with no assertion hunk. The prior `545782c7cee82ed79604dd111fd99fdb24b5398e` comparison is invalid for this attribution because it omitted two pre-existing untracked goal-target-date files. |

## Remediation Result

```json
{"schema":"gentle-ai.remediation-result/v1","status":"recorded-unmanaged-not-finished","mode":"unmanaged","review_gate":"disabled/unmanaged","lineage_id":null,"generation":5,"fix_batch":1,"runtime_attempt_ordinal":5,"work_unit":"correct-fixture-scope-evidence","failed_evidence_revision":"sha256:2fae9409490d76938af2e8be7ab18ba9ad27475473bcb9ba760cd72a039c6c3c","runtime_revision":"sha256:b4fefe5607fc6096538dd848800fe67894d81d3f53fa95fa6585f984bfaf4db1","disposition":"artifact-only correction recorded; parent-owned runtime attempt remains running and was not finished or reset"}
```

```json
{"schema":"gentle-ai.remediation-evidence/v1","evidence_revision":"apply-stable-wizard-fixture-scope-remediation-20260822-005","evidence_sha256":"sha256:4975962ac77c2cbc3f8d8256573158ac5b902a6516a5720aa2b0b0273ba813b2","failed_evidence_revision":"sha256:2fae9409490d76938af2e8be7ab18ba9ad27475473bcb9ba760cd72a039c6c3c","native_attempt_ordinal":1,"native_changed_lines":2,"begin_candidate":"sha256:5eec61079fc72f7166ac64265f1ef2d7fbcf7c2d5e83d60d5b895f67bc6aa0b2","begin_tree":"588671c5a153876df65b4121e02d38245ce97f54","finish_candidate":"sha256:dc21f9a18fce67eb1780e0d3088d2bd27bdfd725e602eba508c9b3fc843de670","finish_tree":"0c2440c868d83d306e2a29f3b71a781c2becc5d9","fixture_diff_sha256":"sha256:d67f70f5be31e74ec236ad2f6b8bf6b435b40bde9ab87d73638ba47c2cd52d7d","fixture_diff":"2026-10-03 -> 2099-10-03; no assertion hunk","excluded_preexisting_paths":["apps/web/features/onboarding/_domain/goal-target-date.ts","apps/web/features/onboarding/_domain/goal-target-date.test.ts"],"canonical_preimage":"change=stabilize-wizard-draft-goal-date-fixture\\nfailed_evidence_revision=sha256:2fae9409490d76938af2e8be7ab18ba9ad27475473bcb9ba760cd72a039c6c3c\\nmode=unmanaged\\nreview_gate=disabled/unmanaged\\nnative_attempt_ordinal=1\\nnative_changed_lines=2\\nbegin_candidate=sha256:5eec61079fc72f7166ac64265f1ef2d7fbcf7c2d5e83d60d5b895f67bc6aa0b2\\nbegin_tree=588671c5a153876df65b4121e02d38245ce97f54\\nfinish_candidate=sha256:dc21f9a18fce67eb1780e0d3088d2bd27bdfd725e602eba508c9b3fc843de670\\nfinish_tree=0c2440c868d83d306e2a29f3b71a781c2becc5d9\\nfixture_diff_sha256=sha256:d67f70f5be31e74ec236ad2f6b8bf6b435b40bde9ab87d73638ba47c2cd52d7d\\nfixture_diff=2026-10-03 -> 2099-10-03; no assertion hunk\\npreexisting_outside_scope=goal-target-date.ts|goal-target-date.test.ts\\nruntime_revision=sha256:b4fefe5607fc6096538dd848800fe67894d81d3f53fa95fa6585f984bfaf4db1\\nparent_disposition=running-not-finished-not-reset\\n"}
```

## Process and Cleanup Evidence

This remediation modified only this apply-progress artifact and the paired hybrid tasks artifacts; no implementation or test bytes, production files, prior change artifacts, review authority, staging, commit, push, PR, runtime server, or background process were touched. Read-only checks confirmed an empty index, no named stashes, and a clean patch check for `apps` and `packages`. Receipt-driven review remains `disabled/unmanaged`. The parent-owned runtime token `sha256:b4fefe5607fc6096538dd848800fe67894d81d3f53fa95fa6585f984bfaf4db1` remains running and was not finished or reset.
