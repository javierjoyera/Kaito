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
