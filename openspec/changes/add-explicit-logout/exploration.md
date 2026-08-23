## Exploration: Explicit logout for authenticated frontend flows

Issue #120 is approved and targets a missing explicit logout action while preserving Kaito's existing Supabase authentication and protected-route architecture. This corrective pass explains the proposed architecture as a teaching aid: each piece has one job, one location, and one boundary.

### Current State: the observable problem

Kaito has three canonical private surfaces: `/onboarding`, `/plan`, and `/plan/generating`.

- `/onboarding` and `/plan` perform server-side session checks. `/plan/generating` does too. `/plan` additionally applies product-route decisions. `apps/web/proxy.ts:10` currently matches only `/login` and `/onboarding`; `/plan` and `/plan/generating` rely on their page-level guards.
- The browser Supabase client is cached by `getBrowserSupabaseClient()` in `apps/web/features/auth/_infrastructure/supabase/browser.ts:24`; access tokens come from `getAccessToken()` in `apps/web/features/auth/_adapters/get-access-token.ts:11`.
- There is no visible logout control. The plan sidebar currently contains only Dashboard/Calendario tabs and block metadata (`apps/web/features/planning/_components/active-plan-dashboard.tsx:215`).
- Sign-out plumbing is duplicated in `OnboardingWizard` (`apps/web/features/onboarding/_components/onboarding-wizard.tsx:73`), `ActivePlanDashboard` (`apps/web/features/planning/_components/active-plan-dashboard.tsx:91`), and `PlanGeneration` (`apps/web/features/planning/_components/plan-generation.tsx:163`). Each clears the E2E cookie in test mode or calls `getBrowserSupabaseClient()?.auth.signOut()` in production mode.

The current request flow is therefore asymmetric:

1. A private API request fails with `auth_required` or `auth_rejected`.
2. The surface creates `createSessionRecoveryController()` from `apps/web/features/auth/_use-cases/session-recovery-controller.ts:10` and injects its local `signOut` helper.
3. The recovery controller attempts sign-out, deliberately swallows provider failure, and redirects to `/login?returnTo=...`.
4. A user who intentionally wants to leave has no equivalent action; adding three independent buttons would repeat the provider/test details and could produce three different pending, failure, and navigation behaviors.

This distinction matters: automatic recovery is a best-effort safety response to an invalid session; explicit logout is a user-requested operation whose success must not be claimed until its sign-out operation succeeds.

### Architecture direction: exact pieces and boundaries

The recommended first slice is **one auth use case plus one reusable control, mounted explicitly on each surface**. “Shared logout coordinator” means the following concrete pieces—not an abstract global service:

1. **Provider adapter** — `apps/web/features/auth/_adapters/` (for example, a Supabase sign-out adapter beside the existing sign-in/sign-up adapters).
   - **Does:** translate the provider's `auth.signOut()` result into the auth feature's small provider-independent result/error contract; preserve the E2E cookie-clearing adapter path.
   - **Does not:** decide where to navigate, render UI, own retry state, or change session-recovery policy.
   - **Why here:** `_adapters` already owns the boundary between provider APIs and auth use cases (`supabase-sign-in.ts`, `supabase-sign-up.ts`). Keeping Supabase vocabulary here prevents it from spreading into feature flow and components.

2. **Provider-agnostic explicit logout use case** — `apps/web/features/auth/_use-cases/` (a named logout use case; “coordinator” is only a description of its orchestration role).
   - **Does:** accept an injected adapter, execute one explicit logout operation, normalize success/failure, and provide the single-flight contract needed by the caller.
   - **Does not:** import Supabase, manipulate cookies directly, render a button, or silently redirect on failure. Navigation remains a caller/UI policy chosen by the product decision.
   - **Why here:** `_use-cases` already contains provider-independent auth behavior such as `createSignInWithPassword()` and `createSessionRecoveryController()`. The explicit operation belongs with business flow, not with a route or provider SDK.

3. **Reusable UI control** — `apps/web/features/auth/_components/` (a client logout control).
   - **Does:** render an accessible button, expose pending/error/retry states, guard double activation, call the injected use case, and invoke a success callback only after success.
   - **Does not:** know Supabase, know the E2E cookie name, decide which private routes exist, or own page-specific content.
   - **Why here:** `_components` is the auth feature's presentation boundary. Reuse is justified because onboarding, dashboard, and generation are real runtime consumers of the same auth capability; this is not a speculative generic utility.

4. **Per-surface mounting** — `apps/web/app/(private)/.../page.tsx` and/or the feature component rendered by each page.
   - **Does:** place the control where that surface can explain it and provide navigation/context dependencies. The likely consumers are `OnboardingExperience`/`OnboardingWizard`, `ActivePlanDashboard`, and `PlanGeneration`.
   - **Does not:** reimplement provider sign-out or create a second logout state machine.
   - **Why here:** Next app files own route composition, while feature components own surface-specific layout. Explicit mounting keeps the first slice local to the three verified private surfaces and avoids changing the route tree merely to add one action.

#### Dependency direction

```text
private surface UI
  -> auth LogoutControl (reusable presentation + single-flight guard)
    -> explicit logout use case (provider-agnostic flow)
      -> injected sign-out adapter (contract)
        -> Supabase adapter / E2E adapter (provider or test detail)
```

UI calls a use case, and the use case calls an injected adapter. Therefore the business flow does not depend on Supabase types, cookie names, or SDK behavior. The adapter is replaceable in unit tests and in the existing E2E environment without teaching the button or use case about either provider detail.

**Running analogy — coach, athlete, and training platform:** the UI is the athlete requesting to stop, the use case is the coach's standard workout-completion procedure, and the adapter is the training platform integration that knows the provider's API. The procedure says “end this session”; only the integration knows how Supabase or the E2E harness performs it.

### Before/after request flows

#### Success

- **Before:** there is no explicit request flow. Recovery may call local sign-out and redirect, but the user cannot initiate it.
- **After:** the user activates the control; the guard accepts one request; the control calls the use case; the use case calls the injected adapter; only a successful result enables success navigation (the destination remains unresolved below). The control reports pending while awaiting completion.

**Running analogy — aid-station confirmation:** navigation is the next course marker shown only after the aid station confirms the runner has checked out; pressing “logout” is not itself proof that the session ended.

#### Failure and retry

- **Before:** recovery swallows a provider failure and redirects anyway because recovery must remain available during an invalid-session incident.
- **After:** explicit logout keeps the user on the current surface when the adapter reports failure, exposes an accessible error, returns the control to a retryable state, and does not invoke success navigation. Recovery may continue to use its existing best-effort redirect semantics.

**Running analogy — a failed race timing chip:** explicit logout is like finishing a training session and checking that the timing platform recorded it; if confirmation fails, show the problem and let the runner retry rather than claiming the session ended.

#### Double activation

- **Before:** no shared button exists, so no common double-activation policy exists; duplicated helpers do not provide a UI single-flight boundary.
- **After:** the control's single-flight guard ignores activation while the same operation is pending. The adapter is called once, and one success/failure result controls one navigation/error transition.

**Running analogy — avoiding duplicate lap recording:** pressing the lap button twice before the timing system responds must not record two laps; the guard rejects the repeated activation while the first request is in flight.

#### Invalid-session recovery

- **Before:** a private API returns `auth_required`/`auth_rejected`; `createSessionRecoveryController()` attempts injected sign-out, ignores its failure, then calls `replace('/login?returnTo=...')`.
- **After:** preserve that recovery contract unless a later decision explicitly changes it. Explicit logout and recovery may share the provider adapter, but they must not share the same user-facing success semantics: recovery is best-effort containment, whereas explicit logout is a confirmed user action.

**Running analogy — race abandonment versus planned session completion:** abandonment gets the runner off a potentially unsafe course even if the timing chip cannot be verified; explicit logout is a planned session completion that waits for confirmation before announcing completion.

### Why not a shared `(private)` layout yet?

A shared layout would put one control above onboarding, plan, and generation, but it would also change Next composition and loading/navigation behavior. It would have to coexist with page-level guards, `/plan` product-route decisions, the generation loading screen, and unavailable states. The current repository has no authenticated shell, and the three surfaces do not yet demonstrate identical placement or lifecycle needs.

Per-surface mounting is the smaller, evidence-led slice: it proves the auth boundary without creating a new route-tree boundary. Reconsider a shared `(private)` layout only after evidence shows that at least two or more real private features require the same shell structure, control placement, loading behavior, and navigation policy—not merely the same logout function.

**Running analogy — do not redesign the whole training plan for one repeated workout:** first place the logout control at the three verified surfaces; change the shared training structure only when repeated evidence proves multiple features need the same shell, placement, loading behavior, and navigation policy.

### Tests that prove the architecture

Tests should prove boundaries and behavior, not merely raise a coverage number:

- **Adapter contract unit test** in `apps/web/features/auth/_adapters/`: a fake Supabase client maps provider success/failure correctly; a separate E2E adapter test proves the `kaito-e2e-session` cookie is cleared. The use case must not need either implementation detail.
- **Use-case unit test** in `apps/web/features/auth/_use-cases/`: injected adapter success returns success; injected failure returns failure; adapter exceptions are normalized according to the explicit contract; no provider import or navigation occurs.
- **Control/component test** near `apps/web/features/auth/_components/`: pending state disables or guards activation, a second activation makes no second adapter call, failure renders an accessible error and retry, success calls navigation exactly once, and focus behavior is deterministic. Existing patterns include semantic buttons, `role="status"`/`role="alert"`, and `:focus-visible` in `apps/web/app/styles.css:1466`.
- **Mounting/integration tests** for each surface: the same control is present at the approved placement on `/onboarding`, `/plan`, and `/plan/generating`, including the product-unavailable/loading choice that product decisions settle.
- **E2E session-flow tests** in `apps/web/e2e/session-flow.spec.ts` and relevant surface specs: successful logout reaches the chosen public destination; refresh, direct navigation, and back navigation cannot restore private content; provider failure remains retryable; the E2E adapter behaves like production at the boundary.
- **Recovery regression test** in `apps/web/features/auth/_use-cases/session-recovery-controller.test.ts`: invalid-session recovery still redirects even when injected sign-out rejects, proving explicit logout did not accidentally change best-effort recovery.

### Glossary

| Term | Meaning in this exploration |
|---|---|
| **Coordinator / use case** | The provider-independent function that orchestrates one explicit logout operation; “coordinator” is not a global singleton or UI service. |
| **Adapter** | A narrow translation layer that turns Supabase or E2E operations into the use case's provider-neutral contract. |
| **Single-flight** | At most one logout request is in flight for one control activation context. |
| **Guard** | The boolean/ref check that rejects a second activation while the first request is pending. |
| **Surface** | A user-visible authenticated route or experience: onboarding, active plan, or plan generation. |

### Affected Areas

- `apps/web/features/auth/_use-cases/session-recovery-controller.ts` — current recovery contract always redirects after swallowing sign-out failure; it is the minimum common coordination seam to assess.
- `apps/web/features/auth/_adapters/` and `apps/web/features/auth/_infrastructure/supabase/browser.ts` — provider-specific sign-out and canonical browser client boundary.
- `apps/web/features/auth/_components/` — reusable client control and its accessibility state machine.
- `apps/web/features/onboarding/_components/onboarding-wizard.tsx` — private surface with duplicated recovery sign-out helper.
- `apps/web/features/planning/_components/active-plan-dashboard.tsx` — primary authenticated dashboard and likely visible action placement.
- `apps/web/features/planning/_components/plan-generation.tsx` — authenticated loading surface; behavior while generation runs needs product confirmation.
- `apps/web/app/(private)/onboarding/page.tsx`, `apps/web/app/(private)/plan/page.tsx`, `apps/web/app/(private)/plan/generating/page.tsx` — page-level session protection and mounting context.
- `apps/web/proxy.ts` and `apps/web/features/auth/_infrastructure/supabase/{server,proxy}.ts` — post-logout protection and cookie/session invalidation boundaries; likely verification targets, not necessarily implementation targets.
- `apps/web/e2e/session-flow.spec.ts`, `apps/web/e2e/product-route-guard.spec.ts`, `apps/web/e2e/{onboarding,active-plan-dashboard,plan-generating}.spec.ts` — focused success, retry, keyboard, back/refresh, and private-content tests.
- `apps/web/app/styles.css` — focus-visible and pending/error presentation.

### Approaches

1. **Provider-neutral use case + reusable control + per-surface mounting (recommended)** — centralizes duplicated sign-out plumbing while preserving the current route tree.
   - Pros: clear dependency direction; single-flight and failure semantics are unit-testable; small architectural blast radius.
   - Cons: placement wiring remains in three surfaces; product choices below remain necessary.
   - Effort: Medium

2. **Shared authenticated `(private)` layout** — owns one control above all private routes.
   - Pros: one shell and one mounting boundary if the surfaces truly share those needs.
   - Cons: larger composition change; risks mismatched loading, route-guard, product-unavailable, and generation behavior before evidence supports it.
   - Effort: Medium/High

### Recommendation and non-goals

Proceed to proposal only with Approach 1: a named auth use case, an injected provider adapter, a reusable accessible control, and explicit mounting at the approved surfaces. Do not silently change `createSessionRecoveryController()` from best-effort recovery to explicit-user failure semantics.

Non-goals: provider replacement, global device/session revocation, account management, login/register redesign, route-guard redesign, broad frontend refactoring, cancellation of plan generation, or changes to private API authorization.

### Unresolved product decisions (preserved, with consequences)

1. **Placement and generation availability:** should logout appear in one future shell, in the plan sidebar plus onboarding/generation, or elsewhere—and should it be usable while `/plan/generating` is running? This determines which surfaces mount the control and whether logout competes with or interrupts generation.
2. **Success destination:** should success use `/login`, the public home/landing entry, or another route? The repository currently makes `/login` the public entry (`apps/web/app/page.tsx:3`), but this choice determines the navigation callback and the E2E assertion after confirmed sign-out.
3. **Provider failure policy:** should explicit logout remain on the current surface with an error/retry, while only invalid-session recovery redirects to login? Choosing the former preserves the semantic distinction described above; choosing a shared redirect policy risks telling users explicit logout succeeded when it did not.
4. **Navigation/cache strategy:** after success, should the UI use `router.replace`, hard navigation, or another cache-clearing strategy? This determines how strongly the implementation can prove that refresh/back/direct navigation cannot resurrect private content.
5. **Mounting versus shared layout:** is the narrow per-surface approach preferred, or is a shared `(private)` layout acceptable now? The narrow choice limits blast radius; the layout choice accepts route-composition work and should be justified by shared-shell evidence.

### Risks

- The current recovery controller intentionally redirects even when provider sign-out fails. Reusing it unchanged for explicit logout could falsely report success; changing it globally could regress recovery.
- Supabase completion, cookie propagation, Next router cache, browser back/forward cache, and server page guards must align to prevent private-content resurrection.
- `/plan` and `/plan/generating` are not covered by `proxy.ts`'s matcher, so protection must be proven through their server guards and fresh navigation, not inferred from middleware.
- The E2E cookie adapter is a separate test-only path and must remain equivalent at the adapter boundary without weakening production behavior.
- Error copy, focus target, failed-control enabled state, and generation interruption remain product/accessibility decisions.

### Ready for Proposal

Yes, from a repository-understanding perspective. Proposal work should first record the five product decisions above; no specs, design, tasks, implementation, commits, or PRs are part of this corrective exploration.
