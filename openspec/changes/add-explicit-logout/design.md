# Design: Add Explicit Logout to the Plan Dashboard

## Chosen Architecture

Add a browser adapter, provider-neutral use case, and accessible client control; compose them only in `ActivePlanDashboard`. This follows Kaito's auth boundaries (`_adapters` translate, `_use-cases` normalize, `_components` interact) without inventing a private shell. Like a race checkpoint, the adapter reads timing, the use case confirms checkout, and the dashboard chooses the next marker.

## Proposed File and Symbol Map

| File / symbol | Responsibility and dependencies | Explicit non-responsibility |
|---|---|---|
| `apps/web/features/auth/_adapters/browser-sign-out.ts` — `createBrowserSignOutAdapter` | Under the existing test gate clear `kaito-e2e-session`; otherwise call cached Supabase `auth.signOut`; map missing client/error to `{ ok: false }`. | UI, retry, navigation, recovery policy. |
| `apps/web/features/auth/_use-cases/explicit-logout.ts` — `ProviderSignOutAdapter`, `ProviderSignOutResult`, `LogoutOutcome`, `ExplicitLogout`, `createExplicitLogout` | Convert adapter result or thrown exception into `success | error`; never leak provider data. | Single-flight, focus, copy, navigation. |
| `apps/web/features/auth/_components/logout-control.tsx` — `LogoutControl` | Receive `logout` and `onSuccess`; own idle/pending/error state, ref-based single-flight, semantic feedback, retry, and focus. | Supabase, cookies, destination choice. |
| `apps/web/features/planning/_components/active-plan-dashboard.tsx` — `ActivePlanDashboard`, `Plan`, `DashboardSidebar` | Compose dependencies, mount in a sidebar footer below metadata, and on success call `window.location.replace("/login")`. | Other surfaces/guard redesign. |
| `onboarding-wizard.tsx`, `plan-generation.tsx`, `active-plan-dashboard.tsx` | Replace duplicated recovery sign-out helpers with the adapter, ignoring its result through recovery's `Promise<void>` callback. | Confirmed-success recovery semantics. |
| `apps/web/app/styles.css` | Add `.logout-control`/sidebar-footer responsive, focus, error, pending rules beside plan-sidebar CSS. | Design-system extraction. |
| `browser-sign-out.test.ts`, `explicit-logout.test.ts`, `session-recovery-controller.test.ts` | Adapter equivalence, normalization, recovery regression. | Route behavior. |
| `apps/web/e2e/active-plan-dashboard.spec.ts`, `session-flow.spec.ts` | Placement, interaction, failure/focus, full navigation, cookie and private-route safety. | Provider internals. |

## Dependency and Sequences

```text
ActivePlanDashboard -> LogoutControl -> createExplicitLogout -> ProviderSignOutAdapter
                                                       -> Supabase | gated E2E cookie

success: activate -> pending -> adapter ok -> success callback -> location.replace(/login) -> server guard
failure: activate -> pending -> error/throw -> alert -> focus retry button -> retryable idle
recovery: private API auth error -> shared adapter attempt (outcome ignored/throw swallowed)
         -> router.replace(/login?returnTo=...) regardless
```

Navigation belongs to dashboard/control composition because destination and history replacement are surface policy. In the adapter it couples provider translation to routes; in the use case it couples auth flow to browser navigation. Like checkout confirmation versus choosing the route home, they are separate decisions.

## Resolved Contracts and Decisions

```ts
type ProviderSignOutResult = { ok: true } | { ok: false };
type LogoutOutcome = { status: "success" } | { status: "error" };
```

The use case catches every exception as `error`. A synchronous control ref—not React state/use case—rejects duplicates. Pending uses a disabled `aria-busy` button and `role="status"`. Failure shows `role="alert"` (“No hemos podido cerrar tu sesión. Inténtalo de nuevo.”), enables/focuses the same button as “Reintentar cierre de sesión,” and retry clears the alert before one fresh operation. Gated E2E uses a consumed `sessionStorage` fail-once value; success clears the session cookie.

## Rejected Alternatives

| Alternative | Rejection |
|---|---|
| Direct Supabase component call | Leaks provider/test mechanics. |
| Global service | Hides ownership; adds mutable cross-surface lifecycle. |
| Shared private layout | Changes composition/loading/guards for one control. |
| Changed recovery semantics | Could strand invalid sessions; recovery remains best-effort evacuation. |

## Scenario-to-Proof Map

| Spec scenarios | Boundary | RED proof |
|---|---|---|
| Surface limit; keyboard activation | Dashboard/control | Playwright `/plan`, `/onboarding`, `/plan/generating` |
| Double activation; pending observable | Control | Playwright delayed adapter/call count |
| Success; private history safety | Dashboard + existing page guards | Playwright navigation, back, refresh, direct routes |
| Rejection/throw; retry success | Use case/control | Node normalization tests + Playwright fail-once/focus |
| Adapter equivalence | Adapter contract | Node Supabase/E2E cases |
| Recovery regression | Recovery controller/wiring | Node rejection test + existing route-recovery E2E |
| Semantic status/focus | Control/CSS | Playwright role, text, focus, non-color assertions |

## Threat Matrix

Browser navigation is applicable, but the supplied matrix concerns shell/VCS boundaries:

| Boundary | Applicability / response | RED tests |
|---|---|---|
| Documentation-like paths | N/A — no classification/execution | None |
| Git repository selection | N/A — no Git | None |
| Commit state | N/A — no commits | None |
| Push state | N/A — no push | None |
| PR commands | N/A — no PR automation | None |

Route safety is covered by the scenario proofs above.

## Migration, Rollback, and Phase Boundary

No migration/flag. Later order: RED contracts, adapter/use case, control, dashboard/recovery, CSS/E2E; rollback reverses it without changing guards/controller. Before verification record worktree bytes: `next build` may normalize `apps/web/next-env.d.ts`; classify separately and restore unrelated pre-verification bytes. These are design decisions; `sdd-tasks` schedules work later. No open questions.
