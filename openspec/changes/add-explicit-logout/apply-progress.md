# Apply Progress: Add Explicit Logout

## PR1 `auth` strict-TDD rework

**Status:** complete. Generation 3, ordinal 3 completed corrected task 1.3 as an approval-tested behavior-preserving refactor. Tasks 1.1 and 1.2 retain their valid generation-2 strict-TDD evidence.

## Invalidated Previous Attempt

The prior PR1 attempt is retained as **INVALIDATED**. Its behavior and scope checks passed, but it recorded only aggregate RED/GREEN evidence and lacked contemporaneous per-task Safety Net, RED, GREEN, TRIANGULATE, and REFACTOR evidence. Its checked tasks are not valid completion evidence for this rework.

## TDD Cycle Evidence

| Task | Test file / layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR | Outcome |
|---|---|---|---|---|---|---|---|
| 1.1 | `browser-sign-out.test.ts` / Unit | N/A — new adapter and test files | `pnpm --filter web exec tsx --test features/auth/_adapters/browser-sign-out.test.ts` → exit 1; module `./browser-sign-out` absent; 0 pass, 1 fail | Same command → exit 0; 4 pass, 0 fail; E2E and Supabase outcomes map to `{ ok }` | Added gated-E2E/no-Supabase-call case; same command → exit 0; 5 pass, 0 fail | No refactor needed; adapter remained minimal after the passing triangulation run | Complete |
| 1.2 | `explicit-logout.test.ts` / Unit | N/A — new use-case and test files | `pnpm --filter web exec tsx --test features/auth/_use-cases/explicit-logout.test.ts` → exit 1; module `./explicit-logout` absent; 0 pass, 1 fail | Same command → exit 0; 4 pass, 0 fail; provider result, rejection, and throw normalize to closed outcomes | Added sequential false/true provider outcome case; same command → exit 0; 5 pass, 0 fail | No refactor needed; closed contract and catch boundary remained minimal after the passing triangulation run | Complete |
| 1.3 (generation 2) | `session-recovery-controller.test.ts` / Unit | `pnpm test:web-auth` → exit 0; 112 pass, 0 fail; preserved existing recovery behavior before consumer edits | Blocked — existing recovery already redirects after a rejected/failed sign-out; a test demanding imports or callback identity would be implementation-coupled | Not started | Not started | Not started | Honest stop preserved |
| 1.3 (generation 3, ordinal 3) | `session-recovery-controller.test.ts` / Unit characterization | `pnpm --filter web exec tsx --test features/auth/_use-cases/session-recovery-controller.test.ts` → exit 0; 3 pass, 0 fail | N/A — corrected task is a behavior-preserving approval refactor; no observable behavior change and no failing RED permitted | Approval tests before production edits: same command → exit 0; 4 pass, 0 fail | `auth_required` and `auth_rejected` rejected-sign-out scenarios preserve distinct encoded `returnTo` destinations | Replaced three duplicated browser/Supabase helpers with `browserSignOut`; same approval command after refactor → exit 0; 4 pass, 0 fail | Complete |

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `pnpm test:web-auth` — exit 0; 113 pass, 0 fail. The task-specific approval command passed 4/4 both before and after the production refactor. |
| Runtime harness | N/A — PR1 changes no UI, route, or navigation behavior. The deterministic controller approval tests exercise the observable recovery outcome; browser E2E remains assigned to PR3–PR4. |
| Rollback boundary | Revert the three recovery-consumer imports/wrappers in `onboarding-wizard.tsx`, `plan-generation.tsx`, and `active-plan-dashboard.tsx`, plus the added `auth_rejected` characterization. Adapter/use-case files and tasks 1.1–1.2 are independently removable. |

## Normalization and Verification

- Source-mutating ESLint normalization after refactor: `pnpm --filter web exec eslint . --fix --max-warnings=0` → exit 0; no output.
- Final focused-auth verification: `pnpm test:web-auth` → exit 0; 113 pass, 0 fail.
- Final build: `pnpm build:web` → exit 0; Next.js compiled, type-checked, and generated 9/9 static pages.
- Authored changed-line total: 249 additions + 23 deletions = 272 lines, including code, tests, tasks, and apply-progress; below the 400-line PR1 budget.

## Scope and Delivery

- Chain: `feature-branch-chain`; PR1 `auth` targets tracker `feat/explicit-logout`.
- Implemented only PR1 tasks 1.1–1.3. No UI/control, dashboard mount/footer/CSS, explicit `/login` navigation, route-guard, E2E, branch, commit, push, or PR work was performed.
- No scope drift or design deviation: recovery ignores the adapter `{ ok }` result through its existing `Promise<void>` dependency, preserving best-effort redirects after provider failure.

## Native Attempt Context

- Generation 3, ordinal 3; work unit `pr1-auth-recovery-refactor`; outcome `passed`.
- Terminal runtime revision: `sha256:89a316808f1c2cee6bbc2bf3cd08e19d07360a575b57c9b5e229282755d4bf82`.
- Evidence revision: `sha256:7b9f0caa05da80681d1132b163a5227990d7c5830355b90e73189a469c2e0c51`.
- Remediates failed evidence: `sha256:1a9c16ee50fe62b86a124da59e77e37e79fb0b3097b305e4fb38ba41e1f198b3`.
- Final diagnosis: task 1.3 completed as an approval-tested behavior-preserving refactor and PR1 now has valid strict-TDD evidence/final checks.
- Native status: `complete`; `next_action: complete`.
- Lifetime attempts: 3; lifetime changed lines: 184.

## PR2 `control` strict-TDD preflight

**Status:** blocked before RED. The required rendered-control/focus test layer is unavailable within the PR2 boundary. No production or test source was created or changed, and task 2.1 remains unchecked.

## TDD Cycle Evidence — PR2

| Task | Test file / layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR | Outcome |
|---|---|---|---|---|---|---|---|
| 2.1 | No honest rendered component/focus layer available | `pnpm test:web-auth` → exit 0; 113 pass, 0 fail | Blocked — `tsx --test` has no DOM renderer; `jsdom`, `happy-dom`, `@testing-library/react`, and `@testing-library/user-event` are absent | Not started | Not started | Not started | Blocked without fabricating tests or adding a framework |

## PR2 Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | Safety-net command `pnpm test:web-auth` → exit 0; 113 pass, 0 fail. No focused rendered-control test command exists with installed tooling. |
| Runtime harness | N/A only for completed intentionally unmounted controls when a real rendered integration test exists. That condition is not met: Playwright can test only mounted routes, while PR2 explicitly forbids mounting; Node `tsx` cannot render/focus React without an installed DOM harness. |
| Rollback boundary | None — no PR2 source or test files were changed. |

## PR2 Blocking Discovery and Scope

- The available test runner is Node `tsx --test`; repository dependencies contain no DOM renderer or component-testing library (`jsdom`, `happy-dom`, `@testing-library/react`, and `@testing-library/user-event` are all absent).
- Adding a test framework or mounting the control would violate the assigned scope and Strict TDD instruction not to invent a framework. SSR or source assertions cannot prove pending interaction, semantic status updates, retry, or deterministic focus.
- PR2 native runtime attempt remains untouched: generation 4, ordinal 4, work unit `pr2-logout-control`, evidence revision `sha256:a1953a4f5f0485b88fa2265f7c9e4080c04440c8ddc6a7d637a5167dabd6a326`.
- No PR3/PR4, dashboard/route/navigation/CSS/E2E, adapter/use-case, branch, commit, push, or PR changes were made.

## PR2 `harness` strict-TDD preflight (generation 5, ordinal 5)

**Status:** blocked before RED. The safety net passed, then approved infrastructure installation was immediately reverted because pnpm regenerated `pnpm-lock.yaml` beyond the hard 400 additions-plus-deletions cap for the complete branch diff. Tasks 2.1 and 2.2 remain unchecked; no harness source or test was created.

| Evidence | Result |
|---|---|
| Safety net | `pnpm test:web-auth` → exit 0; 113 pass, 0 fail. |
| Install and budget inspection | `pnpm --filter web add -D jsdom global-jsdom @testing-library/react @testing-library/dom @testing-library/user-event` resolved `jsdom` 30.0.1, `global-jsdom` 29.0.0, `@testing-library/react` 16.3.2, `@testing-library/dom` 10.4.1, and `@testing-library/user-event` 14.6.4. It produced 2,467 additions + 3,726 deletions in `pnpm-lock.yaml`; complete branch diff became 2,570 additions + 3,808 deletions (6,378), exceeding 400. |
| Rollback | Restored only `apps/web/package.json` and `pnpm-lock.yaml` to `HEAD`; complete branch diff returned to 98 additions + 82 deletions (180). |
| Runtime harness | N/A — no harness exists because the size gate blocked before RED. |

- Native runtime attempt unchanged: generation 5, ordinal 5; work unit `pr2-dom-component-harness`; evidence revision `sha256:dcbe93f966dde831c3b10c55182c123d342b0ef3a9748758b68714891a54f06b`.
- No production imports, logout control, dashboard mount, CSS, routes, navigation, Playwright, provider simulation, PR1 alteration, commit, push, or PR work was performed.

## PR2 `pnpm-lock` normalization (generation 6, ordinal 6)

**Status:** complete. This is the maintainer-approved generated-artifact `size:exception` work unit `pr2-pnpm-lock-normalization`, limited to canonical `pnpm-lock.yaml` serialization. It did not add dependencies or modify manifests, source, tests, runtime, configuration, or `node_modules`.

### Approval / Strict-TDD Evidence

No executable production behavior is introduced, so a fabricated RED test would not be honest. The pre-normalization lockfile's resolved logical graph is the approval baseline; graph equality, frozen acceptance, and byte convergence are the behavior-preserving GREEN/refactor proof.

| Task | Safety net / approval baseline | RED | GREEN | TRIANGULATE | REFACTOR | Outcome |
|---|---|---|---|---|---|---|
| 2.1 | `test "$(pnpm --version)" = "11.0.0"`; all package manifests byte-identical to `b959533`; pre graph SHA-256 `7c304d2d373c2953e1786d0b59560fafbdd0a3628964d32338feed2f6ca96e5f` | N/A — no production behavior or test surface | Approval baseline captured successfully | N/A — one deterministic graph representation | N/A — generated serialization only | Complete |
| 2.2 | Same unchanged-manifest baseline | N/A — no production behavior or test surface | `pnpm install --lockfile-only` (pnpm 11.0.0) → exit 0; canonical serialization written | N/A — lock graph has no new inputs | Serialization refactor only | Complete |
| 2.3 | Pre graph approval hash | N/A — no production behavior or test surface | Post graph SHA-256 matches pre exactly; frozen and second-run convergence passed | Frozen and second-run probes independently confirm the same serialization | No further refactor; bytes remained canonical | Complete |
| 2.4 | Exact-path and manifest guards against `b959533` | N/A — no production behavior or test surface | Guards passed; only approved paths changed | Manifest, graph-count, frozen, convergence, and path probes cover independent invariants | N/A — no source refactor | Complete |

### Normalization Proof

- Pinned tool: `pnpm --version` → `11.0.0`.
- Pre command: `pnpm list -r --lockfile-only --json --depth Infinity | jq -S -c . | shasum -a 256` → `7c304d2d373c2953e1786d0b59560fafbdd0a3628964d32338feed2f6ca96e5f`.
- Canonicalization: `pnpm install --lockfile-only` → exit 0; no `node_modules` write expected or observed.
- Post command: same deterministic graph pipeline → `7c304d2d373c2953e1786d0b59560fafbdd0a3628964d32338feed2f6ca96e5f`; exact equality passed.
- Header changed only in canonical quoting: `lockfileVersion: "9.0"` → `lockfileVersion: '9.0'`. Importers: `3` → `3`; packages: `580` → `580`; snapshots: `581` → `581`.
- Canonical lock SHA-256: `3019bf3197bcba2b02be03e428b8b70750cd11f03f0b1ceb49421b9b59b50d93`.
- `pnpm install --frozen-lockfile --lockfile-only` → exit 0; lock SHA-256 remained `3019bf3197bcba2b02be03e428b8b70750cd11f03f0b1ceb49421b9b59b50d93`.
- Second `pnpm install --lockfile-only` → exit 0; lock SHA-256 remained `3019bf3197bcba2b02be03e428b8b70750cd11f03f0b1ceb49421b9b59b50d93`; `cmp` against the first canonical bytes passed.
- Temporary graph and lock witnesses were created outside the repository and removed by an exit trap.

### PR2 Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused proof command and exact result | The deterministic pre/post graph pipeline above produced equal SHA-256 hashes; `pnpm install --lockfile-only`, `pnpm install --frozen-lockfile --lockfile-only`, and the second `pnpm install --lockfile-only` each exited 0. |
| Runtime harness | N/A — this work unit changes generated dependency serialization only. Semantic graph equality, frozen-lock acceptance, and byte convergence are the proportional runtime-independent proof; application tests/builds are not applicable. |
| Scope / path proof | Relative to `b959533`, exact changed paths are `openspec/changes/add-explicit-logout/apply-progress.md`, `openspec/changes/add-explicit-logout/design.md`, `openspec/changes/add-explicit-logout/tasks.md`, and `pnpm-lock.yaml`. All package manifests are byte-identical; no source, test, config, runtime, dependency, or `node_modules` paths changed. |
| Rollback boundary | Revert canonical `pnpm-lock.yaml` plus this work unit's OpenSpec traceability; manifests and the logical dependency graph remain unchanged, with no unrelated behavior to remove. |

### Size Exception and Native Context

- Generated lockfile diff relative to `b959533`: `+2019 -3726`, total `5745` lines; within the approved maximum native budget of `7000` and authorized only for canonical `pnpm-lock.yaml` normalization.
- Chain remains `feature-branch-chain`: PR2 `chore/pnpm-lock-normalization` targets immediate parent `feat/explicit-logout-auth`; no commit, push, or PR was created.
- Native attempt completed: generation `6`, ordinal `6`, work unit `pr2-pnpm-lock-normalization`; outcome `passed`; native status `complete`; `next_action: complete`.
- Terminal runtime revision: `sha256:466e8a5bb7566f9539324dfa33ae330828d6eafb0cd481bce31870cc59459f4a`.
- Evidence revision: `sha256:a07d6e0b4fdaa9bb2505e0cc6fef064c46aa0ced36bbb74dd2941fff21c6ed91`.
- Remediates failed harness evidence: `sha256:46ff1397b6ba39d44cfa6034d71b93ef199455ca46ddc0d442ccdc854f56fffa`.
- Native candidate changed lines: `5795`; lifetime attempts: `6`; lifetime changed lines: `6018`.
- Final diagnosis: pnpm 11 canonicalized the lock with identical logical graph, frozen acceptance, byte convergence, and unchanged manifests.

## PR3 `harness` strict-TDD attempt (generation 7, ordinal 7)

**Status:** blocked and reverted before GREEN. The approved matched DOM dependency set is compatible with the declared Node and React support, but its minimal lockfile delta alone exceeded the strict PR3 400 changed-line budget.

### TDD Cycle Evidence — PR3

| Task | Test file / layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR | Outcome |
|---|---|---|---|---|---|---|---|
| 3.1 | `shared/testing/dom-component-test-harness.test.tsx` / Node DOM integration | `pnpm test:web-auth` → exit 0; 113 pass, 0 fail | Test written first; `pnpm --filter web exec tsx --test shared/testing/dom-component-test-harness.test.tsx` → exit 1; `./dom-component-test-harness` absent; 0 pass, 1 fail | Blocked before production harness code: dependency install breached budget | Not started — GREEN was blocked | Not started — no production code exists | Blocked and reverted |
| 3.2 | `shared/testing/dom-component-test-harness.ts` / Node DOM integration | Same safety net | N/A — depends on task 3.1 RED | Blocked: install did not fit the 400-line child budget | Not started | Not started | Blocked and reverted |

### Work Unit Evidence — PR3

| Evidence | Result |
|---|---|
| Compatibility proof | Node `v24.18.0` satisfies `jsdom@29.1.1` (`^20.19.0 || ^22.13.0 || >=24.0.0`) and `global-jsdom@29.0.0` (`>=20`), while `global-jsdom@29.0.0` peers `jsdom >=29 <30`. `@testing-library/react@16.3.2` peers React/React DOM/types `^18 || ^19` and DOM `^10`; the repository declares React 19.2.0 and matching types. |
| Focused test command and exact result | `pnpm --filter web exec tsx --test shared/testing/dom-component-test-harness.test.tsx` → exit 1; 0 pass, 1 fail because `./dom-component-test-harness` did not exist. The safety net `pnpm test:web-auth` → exit 0; 113 pass, 0 fail. |
| Runtime harness command/scenario and exact result | N/A — no runtime harness exists after the mandatory budget rollback; no DOM component or mounted route was introduced. |
| Budget measurement | `pnpm --filter web add -D jsdom@29.1.1 global-jsdom@29.0.0 @testing-library/react@16.3.2 @testing-library/dom@10.4.1 @testing-library/user-event@14.6.6` → exit 0. Immediately against `chore/pnpm-lock-normalization`, tracked dependency delta was `+447 -0` (`apps/web/package.json +5`, `pnpm-lock.yaml +442`); the already-written RED test was `+67`, so the complete attempt reached `+514 -0` (514 changed lines), exceeding 400 before harness production code. |
| Normalization order | Safety net → RED test/execution → compatibility-verified matched dependency install → immediate complete-diff measurement → rollback. No production code, triangulation, or refactor occurred. |
| Rollback boundary | The reverted attempt comprised `apps/web/package.json`, `pnpm-lock.yaml`, and `apps/web/shared/testing/dom-component-test-harness.test.tsx`; no unrelated behavior was changed. |

### Cleanup and Native Context

- Cleanup: deleted the untracked RED test and restored only `apps/web/package.json` and `pnpm-lock.yaml` from `HEAD`. `git status --short`, `git diff --numstat chore/pnpm-lock-normalization`, and `git diff --check chore/pnpm-lock-normalization` were empty/successful after cleanup.
- Process evidence: the focused `tsx` test and `pnpm add` completed; `pgrep -fl 'tsx|next dev|next start|playwright'` returned no owned test/server process.
- Chain: feature-branch-chain child `feat/explicit-logout-harness-pr3` starts at clean immediate parent `chore/pnpm-lock-normalization` (`2481b1a`). The historical `feat/explicit-logout-harness` branch was not an ancestor of the parent, so it was not reused.
- Native attempt: generation `7`, ordinal `7`, work unit `pr3-dom-component-harness`; max attempts `1`; outcome `blocked_budget_reverted` pending orchestrator settlement.
- Evidence revision: `sha256:d220232e152cbaa307cb88c9e3fb3fdf75405cdbff50aaa1850c551eb261fe76`.
- Diagnosis: matched `jsdom@29`/`global-jsdom@29` resolves the prior version mismatch, but canonical pnpm still adds 442 lockfile lines. A compatible harness cannot fit this <=400 child while retaining required dependencies and strict-TDD evidence.

## PR3 `dependencies` strict-TDD completion (generation 8, ordinal 8)

**Status:** complete. Work unit `pr3-dom-test-dependencies` adds only the approved DOM test dependency bootstrap. The maintainer-approved `size:exception` applies solely to the generated `pnpm-lock.yaml` delta.

### TDD Cycle Evidence — PR3 Dependency Bootstrap

| Task | Test file / layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR | Outcome |
|---|---|---|---|---|---|---|---|
| 3.1 | N/A — dependency manifest and lockfile only | `pnpm test:web-auth` → exit 0; 113 pass, 0 fail before mutation | N/A — no executable product behavior or test surface; a RED test would be fabricated | `pnpm --filter web add -D jsdom@29.1.1 global-jsdom@29.0.0 @testing-library/react@16.3.2 @testing-library/dom@10.4.1 @testing-library/user-event@14.6.6` → exit 0; exact entries resolved | N/A — one deterministic dependency set; independent manifest, importer, installed-package, peer/engine, and frozen probes provide proportional coverage | N/A — no production or harness code exists to refactor | Complete |
| 3.2 | N/A — reproducibility/provenance proof | Same 113/113 safety net | N/A — no executable product behavior or test surface | `pnpm install --frozen-lockfile --lockfile-only` → exit 0; `pnpm install --lockfile-only` → exit 0; byte-for-byte convergence passed | Exact-version, peer/engine, importer, path, frozen, and convergence probes independently confirm the result | N/A — generated resolution only | Complete |

### Work Unit Evidence — PR3 Dependency Bootstrap

| Evidence | Result |
|---|---|
| Focused test command and exact result | `pnpm --filter web exec node -e '<manifest/resolution/peer/engine assertion script>'` → exit 0. It verified Node `v24.18.0`; exact versions `29.1.1`, `29.0.0`, `16.3.2`, `10.4.1`, and `14.6.6`; jsdom `^20.19.0 || ^22.13.0 || >=24.0.0`; global-jsdom `>=20` plus jsdom peer `>=29 <30`; Testing Library React peers React/React DOM/types `^18 || ^19` and DOM `^10`; user-event DOM peer `>=7.21.4`. Final `pnpm test:web-auth` → exit 0; 113 pass, 0 fail. |
| Runtime harness command/scenario and exact result | N/A — this work unit adds no source, DOM harness, route, executable test, or runtime behavior. Runtime lifecycle behavior begins in PR4; frozen resolution and byte convergence are the applicable integration boundary here. |
| Frozen lock and convergence | A post-install lock witness had SHA-256 `15944e5e2186f0ff4a5064b3da7266caa199b7bcc52a9f13098c3d36d713d077`. `pnpm install --frozen-lockfile --lockfile-only` → exit 0 and preserved those bytes; a second `pnpm install --lockfile-only` → exit 0 and `cmp` passed. Temporary witness was removed by exit trap. |
| Importer/path/scope proof | `apps/web` importer records the five exact specifiers and resolutions, including `global-jsdom@29.0.0(jsdom@29.1.1)`, Testing Library React with DOM `10.4.1`, and user-event with DOM `10.4.1`. Against `2481b1a`, dependency paths are only `apps/web/package.json` (+5) and `pnpm-lock.yaml` (+442); no source, harness, script, component, route, CSS, navigation, E2E, or runtime file changed. Existing carried OpenSpec traceability paths are `apply-progress.md`, `design.md`, and `tasks.md`. |
| Rollback boundary | Revert the five `apps/web/package.json` devDependency entries, their `pnpm-lock.yaml` importer/package/snapshot records, and this PR3 traceability. No unrelated behavior, harness, or source file is removed. |

### Size, Cleanup, and Process Evidence

- Against exact parent `chore/pnpm-lock-normalization` (`2481b1a`), the generated lockfile delta is `+442 -0` (442 changed lines); the authored manifest delta is `+5 -0` (5 changed lines). The generated-only exception is valid; no native dependency delta exceeds the 600-line maximum.
- The first compatibility assertion probe exited 1 because it incorrectly looked for `node_modules/.pnpm` relative to `apps/web`; it made no repository mutation and left no process. The corrected probe resolved package entry points upward to their matching package manifests and exited 0. A first final accounting probe then exited 127 after its frozen/convergence checks because a zsh variable named `path` shadowed `PATH`; its temporary witness was removed explicitly with `rm`, and the corrected `file_path` probe passed.
- `pnpm`/`tsx` commands completed; `pgrep -fl 'tsx|next dev|next start|playwright|pnpm'` returned no owned process after verification. Temporary lock witnesses were removed by exit trap or explicit cleanup; no repository cleanup or revert was required.
- No `gentle-ai sdd-attempt` command was called. Native attempt generation `8`, ordinal `8`, remains owned by the orchestrator; max attempts `1`, native maximum `600` changed lines.
- Evidence revision: `sha256:3074b70d1a401978b232e4e5185e078dbf79a0be611407cbaeccd5d639e5d30e`, derived deterministically from exact parent/branch, lock SHA-256, generated/authored counts, changed paths, completed tasks, and passing verification facts.

## PR4 `functional DOM harness` strict-TDD completion (generation 9, ordinal 9)

**Status:** complete. Work unit `pr4-functional-dom-harness` adds Node-only DOM component-test lifecycle infrastructure and no product imports or runtime feature behavior.

### TDD Cycle Evidence — PR4

| Task | Test file / layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR | Outcome |
|---|---|---|---|---|---|---|---|
| 4.1 | `shared/testing/dom-component-test-harness.test.tsx` / Node DOM integration | `pnpm test:web-auth` → exit 0; 113 pass, 0 fail | `pnpm --filter web exec tsx --test shared/testing/dom-component-test-harness.test.tsx` → exit 1; module `./dom-component-test-harness` absent; 0 pass, 1 fail | Same command → exit 0; 2 pass, 0 fail | Independent lifecycle cases prove isolated body/focus/storage/user-event/window behavior and failure-path root/global/act restoration | Dynamic Testing Library imports occur only after JSDOM installation; same focused command remained 2/2 and removed React's import-time DOM fallback | Complete |
| 4.2 | Same Node DOM integration test | Same 113/113 baseline before `package.json` edit | N/A — depends on task 4.1's absent-module RED | `pnpm test:web-auth` → exit 0; 115 pass, 0 fail; `.test.tsx` globs include the harness | Script extension is independently proven by the 115-test auth command | Targeted `eslint --fix` completed with no reported changes; focused and full auth tests remained green | Complete |

### Work Unit Evidence — PR4

| Evidence | Result |
|---|---|
| Focused test command and exact result | `pnpm --filter web exec tsx --test shared/testing/dom-component-test-harness.test.tsx` → exit 0; 2 pass, 0 fail. |
| Runtime harness command/scenario and exact result | Same focused command → exit 0; rendered a React input, awaited bound `user-event` focus/type operations, used loopback body/localStorage, then proved a second DOM had no body/storage/window carry-over and a thrown callback still unmounted its React root and restored `window`, `document`, and `IS_REACT_ACT_ENVIRONMENT`. |
| Normalization | `pnpm --filter web exec eslint shared/testing/dom-component-test-harness.ts shared/testing/dom-component-test-harness.test.tsx --fix --max-warnings=0` → exit 0; no output. |
| Rollback boundary | Remove `apps/web/shared/testing/dom-component-test-harness.ts`, its `.test.tsx`, the two `.test.tsx` test-script glob arguments, and this PR4 traceability; no production component, route, provider, CSS, or navigation behavior is affected. |

### Size, Cleanup, and Native Context

- Feature-branch-chain child `feat/explicit-logout-harness-pr3` starts at immediate parent `chore/explicit-logout-dom-test-dependencies` (`e9471ba`); the stale local branch had no unique commits and was safely aligned before work. Historical `feat/explicit-logout-harness` was not used.
- Candidate changed lines against `e9471ba`: `+196 -3 = 199`; all five paths are limited to the harness test, harness source, auth test script, task checkboxes, and cumulative apply-progress.
- `git diff --check e9471ba` completed with exit 0. No temporary files were created; `pgrep -fl 'tsx|next dev|next start|playwright|pnpm'` returned no owned process (exit 1, expected for no matches).
- Evidence revision: `sha256:83c24be8ed6af95e420b37963d021dd73f5f7e9fef0443eb4c13739662b99d0e`, derived from generation/ordinal, exact base/branch, completed tasks, final diff/path set, focused/full test facts, normalization, diff-check, and process status.
- No `gentle-ai sdd-attempt` command was called. Native attempt generation `9`, ordinal `9`, work unit `pr4-functional-dom-harness`, maximum attempts `1`, and native maximum `400` changed lines remain orchestrator-owned.

## PR4 CI Type Remediation (generation 10, ordinal 10)

```json
{"schema":"gentle-ai.remediation-result/v1","lineage_id":"pr4-ci-type-remediation","generation":10,"ordinal":10,"fix_batch":1,"failed_evidence_revision":"sha256:2c8d668ddfa07d1e2be6e0b2d2cab292015afe4309c0effacc143b6c710c0ff9","status":"blocked","complete":false}
```
```json
{"schema":"gentle-ai.remediation-evidence/v1","evidence_revision":"sha256:086dded6ec0858028b50981401b510b955a34ccdadf6f744a73274b374210374","ci":{"run":32897804414,"job":97964367601},"red":{"command":"pnpm build:web","exit":1,"error":"globalThis.IS_REACT_ACT_ENVIRONMENT missing on typeof globalThis at dom-component-test-harness.ts:24"},"green":{"source":"explicit intersection-typed global alias; identical property set and snapshot/restore lifecycle","focused":"2 pass, 0 fail","web_auth":"115 pass, 0 fail","build":"exit 1: pre-existing left possibly undefined at dom-component-test-harness.ts:79"},"normalize":{"command":"pnpm --filter web exec eslint shared/testing/dom-component-test-harness.ts --fix --max-warnings=0","exit":0},"checks":{"diff_check":"git diff --check a8c7fe4: exit 0","process_cleanup":"no owned tsx/Next/Playwright/pnpm process"}}
```

The approved global type/access remediation is in place. It preserves the existing save/set/restore behavior, and no task checkbox, test, dependency, package, product, route, control, dashboard, CSS, navigation, or E2E file changed. The requested successful build cannot be claimed: after the original line-24 RED was fixed, TypeScript exposed the pre-existing independent `left`-possibly-undefined error at line 79. That error is outside the approved scope, so no further source change was made.

| Evidence | Result |
|---|---|
| Focused runtime harness | `pnpm --filter web exec tsx --test shared/testing/dom-component-test-harness.test.tsx` → exit 0; 2 pass, 0 fail. |
| Full auth suite | `pnpm test:web-auth` → exit 0; 115 pass, 0 fail. |
| REFACTOR/NORMALIZE | Targeted source-mutating ESLint `--fix` ran before final verification → exit 0; no output. |
| Final build | `pnpm build:web` → exit 1. The original missing-global error is resolved; TypeScript now stops at the out-of-scope line-79 nullability error. |
| Rollback boundary | Revert the explicit alias/access in `apps/web/shared/testing/dom-component-test-harness.ts` and this remediation evidence; no unrelated behavior is removed. |

- Source remediation diff against `a8c7fe4`: `+4 -1` (5 changed lines). No commit, push, PR edit, review, RDD, or executor-owned `gentle-ai sdd-attempt` command was performed.
- The orchestrator externally settled generation `10`, ordinal `10`, as `failed`; terminal settlement is complete. Changed lines: `27`.
- Terminal runtime revision: `sha256:182091ae911a7f956e71b51baef21773537896ecd1122bc337e06e20028138af`.
- Evidence revision: `sha256:086dded6ec0858028b50981401b510b955a34ccdadf6f744a73274b374210374`.
- Final diagnosis: the original global type error was fixed, then the line-79 nullability failure surfaced.

## PR4 CI Nullability Remediation (generation 11, ordinal 11)

```json
{"schema":"gentle-ai.remediation-result/v1","lineage_id":"pr4-ci-nullability-remediation","generation":11,"ordinal":11,"fix_batch":2,"failed_evidence_revision":"sha256:086dded6ec0858028b50981401b510b955a34ccdadf6f744a73274b374210374","status":"success","complete":true}
```
```json
{"schema":"gentle-ai.remediation-evidence/v1","lineage_id":"pr4-ci-nullability-remediation","generation":11,"ordinal":11,"fix_batch":2,"failed_evidence_revision":"sha256:086dded6ec0858028b50981401b510b955a34ccdadf6f744a73274b374210374","evidence_revision":"sha256:579879b7528703702d914af904127837b1c6a3ad9b9f902f674a48fe49b3b833","red":{"command":"pnpm build:web","exit":1,"error":"left is possibly undefined at dom-component-test-harness.ts:79"},"green":{"source":"explicit left guard followed by unchanged descriptor comparisons"},"triangulate":{"focused":"2 pass, 0 fail","web_auth":"115 pass, 0 fail","build":"exit 0; 9/9 static pages"},"refactor":{"command":"pnpm --filter web exec eslint shared/testing/dom-component-test-harness.ts --fix --max-warnings=0","exit":0},"checks":{"diff_check":"git diff --check a8c7fe4: exit 0","process_cleanup":"no owned tsx/Next/Playwright/pnpm process"}}
```

### TDD Cycle Evidence — PR4 CI Nullability Remediation

| Task | Test file / layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR | Outcome |
|---|---|---|---|---|---|---|---|
| Generation 11 bounded CI remediation | Existing Node DOM integration harness | Existing focused harness and auth tests were preserved; no test changes permitted | `pnpm build:web` → exit 1; TypeScript reports `left` possibly undefined at line 79 | Added `if (!left) return false`; descriptor comparisons remain identical for defined descriptors | Focused harness 2/2; auth suite 115/115; build exit 0 | Targeted ESLint `--fix --max-warnings=0` → exit 0 before final focused/auth/build sequence; no source mutation afterward | Complete |

### Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `pnpm --filter web exec tsx --test shared/testing/dom-component-test-harness.test.tsx` → exit 0; 2 pass, 0 fail. |
| Runtime harness command/scenario and exact result | The same Node DOM integration command mounted the loopback DOM and proved lifecycle/global restoration → exit 0; 2 pass, 0 fail. |
| Rollback boundary | Revert only the generation-11 `left` guard in `apps/web/shared/testing/dom-component-test-harness.ts` and this generation-11 evidence; no unrelated behavior is removed. |

- Final authentication verification: `pnpm test:web-auth` → exit 0; 115 pass, 0 fail.
- Final build: `pnpm build:web` → exit 0; compiled, type-checked, and generated 9/9 static pages.
- Generation-11 delta: source `+3 -1` (4) and this evidence `+31 -0` (31), for `35` changed lines; within the 100-line cap.
- `git diff --check a8c7fe4` → exit 0. Process cleanup check found no owned `tsx`, Next, Playwright, or pnpm process.
- No source mutation occurred after the final focused/auth/build verification; no task checkbox, test, package, dependency, product, route, control, dashboard, CSS, navigation, or E2E file changed.
- No commit, push, PR edit, review, RDD, or executor-owned `gentle-ai sdd-attempt` command was performed.
- The orchestrator externally settled generation `11`, ordinal `11`, as `passed`; native status is `complete`; `next_action: complete`. Changed lines: `35`.
- Terminal runtime revision: `sha256:af16d4841fc2a737e3658afbbd08b23943650012983d7159d2cb9c7da3b20ad7`.
- Evidence revision: `sha256:579879b7528703702d914af904127837b1c6a3ad9b9f902f674a48fe49b3b833`.
- Remediates evidence revision: `sha256:086dded6ec0858028b50981401b510b955a34ccdadf6f744a73274b374210374`.
- Deterministic evidence revision: `sha256:579879b7528703702d914af904127837b1c6a3ad9b9f902f674a48fe49b3b833`, SHA-256 of the canonical remediation facts recorded in the evidence envelope.

## PR5 `control` strict-TDD completion

**Status:** complete. Work unit `pr5-logout-control` adds an unmounted, provider-neutral control only; dashboard mounting and browser navigation remain deferred to PR6–PR7.

### TDD Cycle Evidence — PR5

| Task | Test file / layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR | Outcome |
|---|---|---|---|---|---|---|---|
| 5.1 | `logout-control.test.tsx` / Node DOM component | Existing PR4 harness is the tested DOM lifecycle safety net | `pnpm --filter web exec tsx --test features/auth/_components/logout-control.test.tsx` → exit 1; `./logout-control` absent; 0 pass, 1 fail | Added rendered tests before production code; same command → exit 0; 3 pass, 0 fail | Added keyboard activation case; same command → exit 0; 4 pass, 0 fail | Tests remain wrapper-local, await user events/`act`, and use semantic roles with no runner-global state | Complete |
| 5.2 | `logout-control.tsx` / Node DOM component | Task 5.1 RED establishes the behavior boundary | N/A — task 5.1 owns the absent-module RED | Same focused command → exit 0; 3 pass, 0 fail after minimal client component implementation | Keyboard case, failure result, thrown rejection, deferred single-flight, retry, focus, and successful retry all pass; 4/4 | No code simplification improved the state machine; targeted ESLint normalization ran before final verification | Complete |

### Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused DOM command | `pnpm --filter web exec tsx --test features/auth/_components/logout-control.test.tsx` → exit 0; 4 pass, 0 fail. |
| Final auth suite | `pnpm test:web-auth` → exit 0; 119 pass, 0 fail. |
| Source normalization | `pnpm --filter web exec eslint features/auth/_components/logout-control.tsx features/auth/_components/logout-control.test.tsx --fix --max-warnings=0` → exit 0; completed before final focused and auth verification; no source mutation followed. |
| Behavior proved | Semantic button/status/alert roles; awaited pointer and keyboard events; `aria-busy` plus disabled pending state; ref-backed single flight; `{ status: "error" }` and thrown failure feedback; focused retry; and success callback only after the injected use case confirms success. |
| Rollback boundary | Remove only `logout-control.tsx`, `logout-control.test.tsx`, and this PR5 traceability. No dashboard, CSS, route, navigation, adapter, dependency, script, or E2E path was changed. |

### Scope, Delivery, and Cleanup

- Tasks 5.1 and 5.2 were marked complete in `tasks.md` immediately after final verification. Parent-owned lifecycle work is deferred: PR6 tasks 6.1–6.2 and PR7 tasks 7.1–7.2 remain unchecked.
- Chain boundary: `feature-branch-chain`; PR5 `control` starts at exact parent `c67b4a0a84d5633fbc0ae30c3dfe8cc18c20d92b` and contains only the control, its DOM tests, and required OpenSpec traceability. It must remain under the 400-line PR budget.
- Final delta against the exact parent: `+192 -2 = 194` changed lines across the four allowed paths, below the 400-line PR5 budget. `git diff --check c67b4a0a84d5633fbc0ae30c3dfe8cc18c20d92b` → exit 0. Process cleanup probe `pgrep -fl 'tsx|next dev|next start|playwright|pnpm'` found no owned test, server, browser, or package-manager process.
- No commit, push, PR operation, review/RDD operation, or `gentle-ai sdd-attempt` command was performed. The parent-owned token is `sha256:1a071f421f67c3ccb022a88e843ac5d994abbe6ca534d8f07d6be7f9d63474a7`.
- Evidence revision: `sha256:7ba13adebb2e8c528f0610e570f41425625bd745af32b4c16c23fc26b9bce5f1`, SHA-256 of canonical parent/branch/work-unit/task/path/count/verification/cleanup facts.
