# Verification Report: Add Explicit Logout

## Result

**Status: PASS with warnings.** The approved dashboard-only logout slice satisfies the proposal and specification, all 17 implementation tasks are checked, strict-TDD evidence is present and consistent with the codebase, and the required final command chain passed. No CRITICAL issue or archive blocker was found.

Evidence revision: `sha256:afff35e54bd0d9d92dfa462bd15ab5899653d79332182938d61b340809a69996`.

## Authority and Candidate

- Native status supplied by the parent: OpenSpec store; tasks `17/17`; apply `all_done`; verify `ready`; archive blocked only pending this report; `nextRecommended: verify`.
- Action context: repository workspace, branch `feat/explicit-logout-safety`, exact PR7 parent and current `HEAD` `8260e434089ab5d5575490cb98b5456f249a27af`.
- Verification edit authority was limited to this report. Tests/build produced only ignored outputs; no tracked source, test, design, task, apply-progress, configuration, index, branch, commit, PR, or review state was modified by verification.
- Pre/post app-candidate patch SHA-256: `aade69a83809e25983895e8dc928d5d8314decd5dd84d989f3c9d7fdc1a28b28` (identical).
- `apps/web/next-env.d.ts` current/parent SHA-256 before and after commands: `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651` (canonical and unchanged).

## Proposal Success Criteria

| Criterion | Result | Evidence |
|---|---|---|
| Only `/plan` exposes a bottom-mounted control | PASS | `Plan` renders one footer after `.plan-content`; dashboard E2E proves the control on `/plan` and absence on `/onboarding` and `/plan/generating`. |
| Success signs out once, loads `/login`, and private content cannot return | PASS | `session-flow.spec.ts` proves one main-frame `/login` navigation, session-cookie removal, back/reload safety, and direct `/plan` redirect. |
| Failure remains on `/plan`, is accessible, retryable, and never claims success | PASS | Component tests prove alert/focus/retry; PR7 E2E proves the first adapter failure retains the cookie and route, then retry succeeds. |

The proposal intentionally does not cover logout on every canonical private experience. Issue #120 alignment is external to this repository verification and was not independently verified; this slice must not be represented as full original-issue coverage.

## Specification Coverage

| Requirement / scenario | Result | Evidence |
|---|---|---|
| Dashboard-only control — approved surface | PASS | `active-plan-dashboard.spec.ts`: footer placement and exclusions. |
| Dashboard-only control — keyboard activation | PASS | Keyboard Enter causes the same successful `/login` outcome. |
| Single-flight — double activation | PASS | `logout-control.test.tsx`: deferred operation receives one call across two clicks. |
| Single-flight — observable pending | PASS | Disabled button, `aria-busy="true"`, and `role="status"` with `Logging out`. |
| Confirmed success — full navigation once | PASS | Success callback alone calls `window.location.replace("/login")`; E2E counts exactly one matching main-frame navigation. |
| Confirmed success — private history safety | PASS | E2E verifies cookie absence, no private heading after back/reload, and direct `/plan` redirects to login. |
| Provider failure — rejection or throw | PASS | Use case normalizes `{ok:false}`, promise rejection, and synchronous throw; control exposes an alert and deterministic retry focus. |
| Provider failure — retry succeeds | PASS | Component and browser tests prove error clearing, successful retry, and one confirmed navigation. |
| Provider-neutral boundary — adapter equivalence | PASS | UI depends on `ExplicitLogout`; use case consumes `{ok:true}|{ok:false}`; adapter tests prove equivalent E2E/Supabase outcomes. |
| Provider-neutral boundary — recovery regression | PASS | `session-recovery-controller.test.ts` proves best-effort redirect after sign-out rejection for both recovery kinds. |
| Deterministic accessible status and focus | PASS | Semantic button/status/alert roles, non-color text, pending state, and focused retry are covered by DOM tests and E2E. |

## Design and Runtime Findings

- Provider mechanics remain in `auth/_adapters`; outcome normalization remains in `auth/_use-cases`; accessible state remains in `auth/_components`; placement and navigation remain dashboard-owned.
- The fail-once signal is consumed only inside `browser-sign-out.ts` after `isTestAuthAdapterEnabledInBrowser()` passes. That gate requires non-production mode, flag `1`, and a loopback hostname. A failed test attempt neither clears the session nor requests a Supabase client.
- `location.replace("/login")` is reachable only through `LogoutControl.onSuccess`, after `createExplicitLogout(browserSignOut)` returns success. Recovery retains separate best-effort semantics.
- PR5 DOM evidence appropriately owns pending/single-flight/rejection/throw/retry/focus. PR6 E2E owns footer placement, exclusions, responsiveness, accessibility integration, and keyboard activation. PR7 owns browser failure/retry and navigation/session/history/direct-route safety.
- **WARNING — design coherence:** the design's PR7 file-map row omits `apps/web/e2e/active-plan-dashboard.spec.ts`. The actual one-line semantic correction is explicitly documented as maintainer-authorized bounded remediation in `apply-progress.md`, so it is not hidden scope drift, but the row is stale.

## Task Completion and TDD Compliance

- `tasks.md`: **17 checked, 0 unchecked**. No line matching `^\s*- \[ \]` remains; there is no checkbox completeness blocker.
- `apply-progress.md` contains phase-specific `TDD Cycle Evidence` tables and final PR7 remediation continuity. Reported test files exist in the codebase.
- Executable behavior tasks contain RED, GREEN, triangulation, and refactor/normalization evidence. Generated lock/dependency tasks use documented approval-test evidence rather than fabricated RED tests.
- Current GREEN was independently reconfirmed by the required final suites.

| TDD check | Result | Details |
|---|---|---|
| Evidence reported | PASS | TDD tables exist for implementation phases and PR7 remediation. |
| Tasks covered | PASS | `17/17`; executable tasks have tests and non-executable generated work has proportional approval evidence. |
| Reported test files exist | PASS | Unit, DOM integration, and Playwright files referenced by the evidence are present. |
| GREEN current | PASS | Auth `120/120`; development E2E `91/91`; production E2E `1/1`. |
| Triangulation | PASS | Success/failure/throw/retry, both adapters, route exclusions, and post-logout safety vary outcomes and layers. |
| Safety net | PASS | Cumulative evidence records pre-edit suites or justified new/non-executable boundaries. |

### Test Layer Distribution

Capability-related evidence comprises 15 unit tests across three files, four DOM integration tests in one file, and 16 E2E tests across two files: **35 tests across six files**. The current PR7-modified test files contain six unit tests and 16 E2E tests. All required runners were detected and executed. Coverage analysis was skipped because no coverage tool is configured.

### Assertion Quality

- No tautologies, ghost loops, assertion-free production paths, type-only-only tests, smoke-only tests, or mock-heavy files were found.
- **WARNING:** `apps/web/e2e/active-plan-dashboard.spec.ts:266` asserts `classList.contains("plan-content")`. It supports the bottom-placement requirement but couples the test to a CSS class/DOM implementation detail.

**Assertion quality:** 0 CRITICAL, 1 WARNING.

## Commands and Results

The final required chain was run exactly once during this independent verification:

```text
pnpm test:web-auth && pnpm test:web-e2e && pnpm lint:web && pnpm build:web
```

Result: exit `0`.

- `pnpm test:web-auth`: 120 tests, 120 passed, 0 failed.
- `pnpm test:web-e2e`: development Chromium 91/91 passed; production Chromium 1/1 passed.
- `pnpm lint:web`: exit 0, zero warnings (`--max-warnings=0`).
- `pnpm build:web`: exit 0; compiled, type-checked, and generated 9/9 static pages.
- `git diff --check 8260e434089ab5d5575490cb98b5456f249a27af --`: exit 0 before and after the chain.
- Post-command process probe `pgrep -fl 'tsx|next dev|next start|playwright|pnpm'`: no matches.

Non-blocking command output included the expected synthetic no-DSN browser errors from its dedicated passing test, a registration hydration diagnostic, and the known production E2E warning that `next start` is incompatible with standalone output; all invoked gates still passed.

## PR7 Boundary, Accounting, and Rollback

Before this report, the exact diff contained eight paths: the five planned app code/test paths, the bounded-remediation dashboard E2E path, and three OpenSpec traceability files. App code/tests measured `+158 -2 = 160`; all eight paths measured `+208 -7 = 215`. Adding this 105-line verification artifact yields nine candidate paths and `+313 -7 = 320` changed lines, below 400.

The app rollback boundary is cohesive: revert the adapter fail-once seam/test, confirmed dashboard navigation, session-safety E2E, and bounded dashboard E2E expectation. This does not remove the PR5 control, PR6 footer/CSS, recovery policy, route guards, dependencies, or harness.

## Final Recommendation

The approved first slice is verified and may proceed to archive under the supplied native status. Preserve the explicit issue #120 scope caveat. The stale design file-map row and CSS-coupled placement assertion are non-blocking warnings; no failed requirement, unchecked task, test failure, scope blocker, or archive blocker remains.
