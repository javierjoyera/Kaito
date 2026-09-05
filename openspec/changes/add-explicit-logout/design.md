# Design: Add Explicit Logout to the Plan Dashboard

## Chosen Architecture

Preserve the delivered auth boundary, product behavior, runtime architecture, DOM harness contract, and test semantics. After PR2 lockfile normalization, insert a dependency-bootstrap child before the functional harness. The compatible Node v24.18.0 set is `jsdom@29.1.1`, `global-jsdom@29.0.0`, `@testing-library/react@16.3.2`, `@testing-library/dom@10.4.1`, and `@testing-library/user-event@14.6.6`.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Dependency bootstrap before the harness | Adds one child, but isolates generated dependency churn from authored test infrastructure | Chosen. PR3 contains the five manifest additions and canonical lockfile delta; PR4 keeps the functional harness below 400 changed lines. |
| Dependency and RED harness together | Fewer children, but the measured `+514` diff exceeds the 400-line child budget and obscures review boundaries | Rejected; the blocked attempt was reverted. |
| Dependency `size:exception` | PR3 is `+447` (`apps/web/package.json +5`, `pnpm-lock.yaml +442`) | Approved only for the generated `pnpm-lock.yaml` delta. Authored manifest and traceability work remain review-bounded. |
| Node/tsx DOM component harness | Adds lifecycle infrastructure but proves the control independently | Preserved without Jest, Vitest, happy-dom, or jest-dom. |
| Provider calls or shared private layout | Less wiring, but leaks provider mechanics or expands scope | Rejected; preserve `_adapters` → `_use-cases` → `_components`, with dashboard-owned navigation. |

The split improves reviewability because dependency provenance and generated resolution can be reviewed separately from harness behavior. It also narrows rollback: PR3 can remove only test dependencies, while PR4 can remove only the harness without regenerating or disturbing unrelated functional code.

## DOM Harness Contract (PR4)

`apps/web/shared/testing/dom-component-test-harness.ts` remains Node-only: component test → harness → JSDOM/Testing Library, never production imports. Per non-concurrent test, create a loopback DOM, install globals, set/restore `IS_REACT_ACT_ENVIRONMENT`, and bind user-event to its document. In `finally`, `cleanup()` unmounts roots; body, storage, globals, act state, and window are restored or closed, including failures.

Keep `tsx --test`; extend `test:auth` to `.test.tsx`. Tests retain wrapper-local queries, awaited user-event/`act`, deferred promises, Node `assert`, and `document.activeElement`; no runner-global hooks, `screen` import-order assumptions, Jest matchers, or fake timers.

## Exact Chain Revision and File Map

`PR1 auth → PR2 normalization → PR3 dependency bootstrap → PR4 harness → PR5 control → PR6 surface → PR7 safety → tracker → main`.

The strategy remains `feature-branch-chain`: every child targets its immediate parent, and the tracker stays draft/no-merge. PR3 uses explicit conventional branch `chore/explicit-logout-dom-test-dependencies`, targeting `chore/pnpm-lock-normalization`. PR4 uses the current clean `feat/explicit-logout-harness-pr3`, targeting PR3. Historical `feat/explicit-logout-harness` is not reusable.

| PR | Repository content |
|---|---|
| PR1 | Existing auth adapter/use-case and recovery consumers/tests; unchanged. |
| PR2 | Canonical `pnpm-lock.yaml`; unchanged normalization boundary. |
| PR3 | `apps/web/package.json`, dependency-only `pnpm-lock.yaml`, bounded OpenSpec traceability. No source, harness, or behavior. |
| PR4 | Test script and `shared/testing/dom-component-test-harness{,.test}.tsx`. |
| PR5 | `auth/_components/logout-control{,.test}.tsx`: single-flight, pending/error, retry/focus. |
| PR6 | `active-plan-dashboard.tsx`, `app/styles.css`, dashboard E2E: placement and exclusions. |
| PR7 | `active-plan-dashboard.tsx`, `e2e/session-flow.spec.ts`: confirmed navigation and private-history safety. |

## Contracts, Proof, and Rollback

`ProviderSignOutResult` remains `{ok:true}|{ok:false}`; `LogoutOutcome` remains `success|error`. Pending, alert copy, retry focus, confirmed-only `location.replace("/login")`, once-only navigation, adapter equivalence, and best-effort recovery remain unchanged and are proven in PR5–PR7.

PR3 review verifies exact versions, importer entries, lockfile provenance, and frozen-install compatibility. Its exception excludes authored manifest/traceability lines and becomes invalid if source, harness, runtime, or behavioral tests appear. Revert PR3 to remove only DOM test dependencies; revert PR4 to remove only harness infrastructure. No migration or feature flag.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary is implemented. The chain is a delivery constraint, not application automation.

## Open Questions

None.
