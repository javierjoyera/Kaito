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
