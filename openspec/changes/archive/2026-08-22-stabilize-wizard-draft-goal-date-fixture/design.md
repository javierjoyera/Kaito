# Design: Stabilize Wizard Draft Goal-Date Fixture

## Technical Approach

Change only `completeDraft.goal.target_date` in `apps/web/features/onboarding/_domain/wizard-draft.test.ts` from `2026-10-03` to the canonical far-future fixture `2099-10-03`. This one-line test-data correction satisfies the fixture-durability specification while preserving production code, tested calls, and navigation assertions.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Replace the fixture date with `2099-10-03` | Eventually expires, but remains strictly after the explicit 2031 probe with no runtime impact | Chosen: smallest one-line correction |
| Add a test constant or inject a date boundary | Adds indirection or a production seam for a fixture defect | Rejected: violates the minimal fixture-only scope |

## Data Flow

`completeDraft` fixture → unchanged `firstIncompleteStepIndex` → unchanged `validateStep` → unchanged navigation assertions.

## File Changes

| File | Action | Description |
|---|---|---|
| `apps/web/features/onboarding/_domain/wizard-draft.test.ts` | Modify | Replace only the `target_date` string literal on the existing fixture line. |

No production, backend, API, request-contract, prior-change, assertion, or unrelated test file may change. Deliver as one tiny PR.

## Interfaces / Contracts

None. No function signature, type, production behavior, backend/API contract, or assertion changes.

## Testing Strategy

### Baseline RED evidence

Before the fixture correction, the preserved 2031 probe exits `1`: 5 tests pass and 3 navigation tests fail because `2026-10-03` is past-dated. Recorded output SHA-256: `8ea16b95d025e59d1476a2a9049e948676a45e16e24593f5d2f11c22f7e8ce64`.

```bash
pnpm --filter web exec node --import 'data:text/javascript,globalThis.Date%3Dclass%20extends%20Date%7Bconstructor(...args)%7Bsuper(...(args.length%3Fargs%3A%5B%222031-01-01T12%3A00%3A00.000Z%22%5D))%7Dstatic%20now()%7Breturn%20new%20Date(%222031-01-01T12%3A00%3A00.000Z%22).getTime()%7D%7D' --import tsx --test features/onboarding/_domain/wizard-draft.test.ts
```

### GREEN evidence

Run in order; all must exit `0`:

```bash
pnpm --filter web exec tsx --test features/onboarding/_domain/wizard-draft.test.ts
pnpm --filter web exec node --import 'data:text/javascript,globalThis.Date%3Dclass%20extends%20Date%7Bconstructor(...args)%7Bsuper(...(args.length%3Fargs%3A%5B%222031-01-01T12%3A00%3A00.000Z%22%5D))%7Dstatic%20now()%7Breturn%20new%20Date(%222031-01-01T12%3A00%3A00.000Z%22).getTime()%7D%7D' --import tsx --test features/onboarding/_domain/wizard-draft.test.ts
pnpm test:web-onboarding
```

After recording `APPLY_BASELINE`, the implementation-code scope check must pass and the zero-context diff must show only the fixture literal replacement:

```bash
test "$(git diff --name-only "$APPLY_BASELINE" -- apps packages)" = "apps/web/features/onboarding/_domain/wizard-draft.test.ts"
git diff --unified=0 "$APPLY_BASELINE" -- apps/web/features/onboarding/_domain/wizard-draft.test.ts
```

Unit coverage is sufficient; integration and E2E are not applicable to test-only data.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Rollback: revert the single `target_date` fixture line to `2026-10-03`.

## Open Questions

None.
