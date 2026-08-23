# Design: Add Explicit Logout to the Plan Dashboard

## Chosen Architecture

Preserve the delivered auth boundary and approved DOM harness, control, surface, and safety slices. Insert a pnpm 11 normalization child after PR1 so dependency selection is measured without a 5.5K–5.8K-line formatting rewrite. Like resurfacing the track before timing runners, normalization makes later measurements meaningful without changing the course.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Standalone canonicalization PR | One extra chain child; isolates a huge generated diff | Chosen as PR2, branch `chore/pnpm-lock-normalization`, targeting `feat/explicit-logout-auth`, with generated-file `size:exception`. |
| Normalize while adding DOM dependencies | Fewer PRs, but hides dependency changes inside unrelated churn | Rejected. PR2 changes only `pnpm-lock.yaml`; OpenSpec traceability may accompany it, but no manifests, dependencies, source, or tests. |
| `jsdom@29` + `global-jsdom@29` versus `jsdom@30` + manual globals | Convenience/compatibility versus newer JSDOM/manual lifecycle control | Deferred until post-normalization install measurement. |
| Node/tsx DOM component harness | Adds test dependencies/lifecycle but proves an unmounted component | Preserved. No Jest, Vitest, happy-dom, or jest-dom. |
| Merge harness/control or use Playwright only | Smaller chain, but mixes infrastructure/behavior or cannot prove the control independently | Rejected; preserve autonomous review and rollback boundaries. |
| Direct Supabase UI call/global service/shared private layout/changed recovery semantics | Less wiring, but leaks provider mechanics or alters route/recovery policy | Rejected; preserve `_adapters` → `_use-cases` → `_components`, with navigation owned by the dashboard. |

## DOM Harness Decision (PR3)

`apps/web/shared/testing/dom-component-test-harness.ts` remains Node-only: component test → harness → JSDOM/Testing Library, never production imports. Per non-concurrent test, create a loopback DOM, install globals, set/restore `IS_REACT_ACT_ENVIRONMENT`, and bind user-event to its document. In `finally`, `cleanup()` unmounts roots; body/storage/globals/act state restore and the window closes, including failures.

Keep `tsx --test`; extend `test:auth` to `.test.tsx`. Tests use wrapper-local render queries, awaited user-event/`act`, deferred logout promises, Node `assert`, and `document.activeElement`; no runner-global hooks, `screen` import-order assumptions, Jest matchers, or fake timers. The harness owns no dashboard, CSS, route, navigation, provider simulation, or production abstraction.

## Chain and File Map

`PR1 auth → PR2 normalization → PR3 harness → PR4 control → PR5 surface → PR6 safety → tracker → main`. Every child targets its immediate predecessor; PR3 `feat/explicit-logout-harness` targets `chore/pnpm-lock-normalization`.

| PR | Repository content |
|---|---|
| PR1 | Existing `browser-sign-out.ts`, `explicit-logout.ts`, recovery consumers/tests; unchanged. |
| PR2 | Canonical `pnpm-lock.yaml` only; optional OpenSpec traceability. |
| PR3 | `apps/web/package.json`, minimal dependency lockfile delta, test script, `shared/testing/dom-component-test-harness{,.test}.tsx`. |
| PR4 | `auth/_components/logout-control{,.test}.tsx`: injected use case, single-flight, pending/error, retry/focus. |
| PR5 | `active-plan-dashboard.tsx`, `app/styles.css`, `e2e/active-plan-dashboard.spec.ts`: mount, styling, approved/excluded surfaces. |
| PR6 | `active-plan-dashboard.tsx`, `e2e/session-flow.spec.ts`: confirmed `location.replace("/login")`, history/private-route safety. |

## Lockfile Normalization Proof and Review

From a clean PR2 worktree with unchanged manifests:

```sh
test "$(pnpm --version)" = "11.0.0"
pnpm list -r --lockfile-only --json --depth Infinity | jq -S -c . | shasum -a 256 > "$TMPDIR/kaito-graph.before.sha256"
pnpm install --lockfile-only
pnpm list -r --lockfile-only --json --depth Infinity | jq -S -c . | shasum -a 256 > "$TMPDIR/kaito-graph.after.sha256"
cmp "$TMPDIR/kaito-graph.before.sha256" "$TMPDIR/kaito-graph.after.sha256"
cp pnpm-lock.yaml "$TMPDIR/kaito-pnpm-lock.canonical.yaml"
pnpm install --frozen-lockfile --lockfile-only
pnpm install --lockfile-only
cmp pnpm-lock.yaml "$TMPDIR/kaito-pnpm-lock.canonical.yaml"
git diff --exit-code -- package.json apps/web/package.json packages/api-client/package.json
git diff --name-only | while IFS= read -r p; do case "$p" in pnpm-lock.yaml|openspec/changes/add-explicit-logout/*) ;; *) exit 1;; esac; done
```

Allow only the lockfile and declared OpenSpec traceability paths. Review provenance, graph-hash equality, lockfile header, importer identities/counts, package/snapshot counts, and second-run convergence—not 5K+ generated lines one by one.

The `size:exception` covers generated lockfile normalization only. Any dependency, manifest, source, or test change invalidates it and blocks PR2.

## Contracts, Proof, and Rollback

`ProviderSignOutResult` remains `{ok:true}|{ok:false}`; `LogoutOutcome` remains `success|error`. A synchronous ref rejects duplicates. Pending remains disabled/`aria-busy` with `role="status"`; failure uses `role="alert"` (“No hemos podido cerrar tu sesión. Inténtalo de nuevo.”) and focuses “Reintentar cierre de sesión.” PR4 proves those contracts. PR5 proves placement/exclusions. PR6 preserves consumed fail-once `sessionStorage`, clears the E2E cookie on success, and proves confirmed-only `location.replace`, once-only navigation, and private-history safety. Recovery remains best-effort.

PR2 rollback is a revert of the normalization commit: manifests and logical dependency graph remain unchanged. Later slices stay independently reversible. No data migration or feature flag.

## Threat Matrix

| Boundary | Applicability | Response / RED tests |
|---|---|---|
| Documentation-like paths | N/A — no executable classification | None |
| Git repository selection | N/A — no Git/process automation is implemented | Manual proof runs from the PR2 worktree |
| Commit state | N/A — no commit tooling | None |
| Push state | N/A — no push tooling | None |
| PR commands | N/A — no PR automation | None |

## Open Questions

- [ ] After canonicalization, which candidate produces the smaller compatible dependency delta: jsdom 29/global-jsdom 29 or jsdom 30/manual globals?
