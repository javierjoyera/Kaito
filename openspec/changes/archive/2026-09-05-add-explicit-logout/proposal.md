# Proposal: Add Explicit Logout to the Plan Dashboard

## Outcome and Intent

Authenticated users can end their session from the bottom of `/plan`. Confirmed success fully loads `/login`; failure stays on the dashboard with accessible feedback and retry.

This approved first slice consciously narrows issue #120: it does **not** satisfy the original criterion of a visible action in every canonical private experience. The issue must be aligned afterward so delivery is not presented as full original coverage.

## Scope

### In Scope
- Mount one dashboard-bottom control with single-flight, accessible failure, and retry behavior.
- Isolate Supabase/E2E sign-out behind an auth adapter while preserving recovery's best-effort policy.
- Fully navigate/reload to `/login` only after confirmed success.

### Out of Scope
- Logout on `/onboarding` or `/plan/generating`; a shared private layout.
- Provider replacement, global revocation, account management, route-guard or private API changes.

## Capabilities

### New Capabilities
- `explicit-logout`: Dashboard-only, confirmed logout with safe navigation, accessible failure/retry, and single-flight behavior.

### Modified Capabilities
None.

## Approach and Boundaries

| Boundary | Why it belongs there; what it prevents |
|---|---|
| `auth/_adapters` | Translates Supabase/E2E outcomes; prevents provider details leaking inward. |
| `auth/_use-cases` | Defines provider-neutral logout; prevents UI/provider coupling and false success. |
| `auth/_components` | Owns accessible states and single-flight UI; prevents duplicate state machines. |
| `active-plan-dashboard.tsx` | Owns placement/navigation; prevents premature route-tree redesign. |

```text
/plan dashboard -> auth control -> logout use case -> injected adapter -> Supabase/E2E
```

Like race checkout, only the timing integration knows provider mechanics. Recovery may share the adapter but remains emergency evacuation: best-effort redirect despite failure.

Later design will settle exact contracts, component API, focus behavior, error copy, and tests.

## Affected Areas

| Area | Impact |
|---|---|
| `apps/web/features/auth/{_adapters,_use-cases,_components}` | Logout boundaries and tests |
| `apps/web/features/planning/_components/active-plan-dashboard.tsx` | Dashboard mounting |
| `apps/web/e2e/session-flow.spec.ts` | Session-safety verification |

## Risks and Rollback

| Risk | Likelihood | Mitigation |
|---|---|---|
| Stale private content after logout | Medium | Full reload plus server-guard E2E proof |
| Recovery semantics regress | Medium | Keep policies separate; add regression coverage |
| Reduced scope is mistaken for issue completion | High | Align issue #120 and state the gap explicitly |

Rollback by removing the mount and new logout units/tests; recovery and route guards remain unchanged.

## Dependencies and Success Criteria

- Dependency: approved exploration/product decisions and subsequent issue #120 alignment.
- [ ] Only `/plan` exposes the bottom-mounted control.
- [ ] Success signs out once and fully loads `/login`; refresh/back/direct private navigation reveals no private content.
- [ ] Failure remains on `/plan`, announces an accessible error, permits retry, and never claims success.
