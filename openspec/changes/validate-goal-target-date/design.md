# Design: Validate Goal Target Date

## Technical Approach

Issue #119 remains frontend-only. Onboarding will own pure Gregorian date-only primitives, derive `Europe/Madrid` dates from injected instants, and capture one immutable boundary (`today`, `tomorrow`) per load, field-focus, validation, and submission boundary. Each capture updates the rendered `min`; the submission capture drives both final revalidation and that request's existing `validation_date`. The backend contract and authority remain unchanged.

## Architecture Decisions

| Option | Tradeoff | Decision and rationale |
|---|---|---|
| Onboarding domain module | Duplicates a small `Intl` pattern | Choose `onboarding/_domain/goal-target-date.ts`; it preserves capability ownership and avoids coupling to product-routing or a premature shared utility. |
| Date-only Gregorian operations | More explicit code than `Date.parse` | Parse captured fields, enforce years `0001..9999`, month/day and leap-year bounds, compare canonical strings, and increment one calendar day manually. This rejects normalization and host-timezone effects. |
| Atomic boundary capture | Submission repeats goal validation | Call the injected clock exactly once per boundary and derive both dates from it. Recapture immediately before PUT, revalidate, then use that capture for the payload; this prevents midnight mixing. |
| Goal preflight before every PUT | A later step may return users to Goal | Validate the goal with the current boundary before any save/completion request; on failure select Goal, preserve the draft, expose its error, and send no request. This resolves the spec's later-step rollover ambiguity. |

## Boundaries and Data Flow

`goal-target-date.ts` owns timezone extraction and calendar validity; `step-validation.ts` maps its result into field errors; `OnboardingWizard` owns clock-boundary capture, orchestration, and request gating; `GoalStep` only renders controlled value, constraints, guidance, and feedback.

    clock() once → validation boundary → validate current step/goal
    clock() once → submission boundary ─┬→ revalidate goal
                                        ├→ GoalStep min=tomorrow
                                        └→ existing validation_date=today

Initial load/retry, target-field focus, and each Continue validation refresh the boundary. Immediately before PUT, Continue captures again and reruns goal validation. A passively open field need not run a background timer: focus or Continue refreshes it synchronously, and final revalidation always blocks a rollover before a request.

## Interfaces / Contracts

```ts
type Clock = () => Date;
type MadridDateBoundary = Readonly<{ today: string; tomorrow: string }>;
type GoalDateError = "invalid_date" | "not_future";

function madridDateBoundary(clock?: Clock): MadridDateBoundary;
function validateGoalTargetDate(value: string, madridToday: string): GoalDateError | null;
function validateGoalStep(goal: GoalDraft, madridToday: string): FieldErrors;
function validateStep(step: StepId, draft: OnboardingSnapshotDraft, madridToday?: string): FieldErrors;
```

The optional `validateStep` date defaults to a fresh system boundary for existing non-orchestrated callers; tests and wizard orchestration inject an explicit date. Taxonomy: missing value → existing `required`; malformed, non-canonical, year-zero, or nonexistent date → `invalid_date` (“Introduce una fecha válida con formato AAAA-MM-DD.”); existent date `<= today` → `not_future` (“Elige una fecha posterior a hoy en horario de Madrid.”).

## Accessibility and Preservation

`GoalStep` receives `minimumTargetDate`. The controlled input keeps the rejected string unchanged and never clamps or rewrites it. Persistent help `goal-target-date-help` states the Madrid rule and earliest date. `aria-describedby` always includes help and conditionally appends `goal-target-date-error`; `aria-invalid` reflects errors, and the existing error `role="alert"` announces corrections. Native `min` is guidance only; domain validation is independent.

## File Changes

| File | Action | Responsibility |
|---|---|---|
| `apps/web/features/onboarding/_domain/goal-target-date.ts` | Create | Pure Madrid/date-only primitives and injectable clock. |
| `apps/web/features/onboarding/_domain/goal-target-date.test.ts` | Create | Calendar/timezone contract tests. |
| `apps/web/features/onboarding/_domain/{step-validation.ts,step-validation.test.ts}` | Modify | Error mapping and goal boundary integration. |
| `apps/web/features/onboarding/_components/{onboarding-wizard.tsx,onboarding-step-content.tsx,goal-step.tsx,field-messages.ts}` | Modify | Atomic refresh, gating, prop flow, UI/accessibility. |
| `apps/web/e2e/onboarding.spec.ts` | Modify | Browser-level constraint, association, preservation, and no-PUT proof. |

Forecast: 2 new and 7 modified files, approximately 220–380 authored changed lines; one PR remains below the 800-line budget. No files are deleted.

## Testing Strategy

Strict RED-GREEN-TRIANGULATE-REFACTOR: first RED on malformed/impossible/leap dates, past/today/tomorrow, browser-zone disagreement, Madrid midnight and DST instants; GREEN the primitives; triangulate step error mapping and atomic rollover/no-request E2E; refactor only while green.

| Layer | Command |
|---|---|
| Focused unit | `pnpm --filter web exec tsx --test features/onboarding/_domain/goal-target-date.test.ts features/onboarding/_domain/step-validation.test.ts` |
| Onboarding regression | `pnpm test:web-onboarding` |
| Focused E2E | `pnpm --filter web exec playwright test e2e/onboarding.spec.ts --grep "goal target date"` |
| Quality | `pnpm lint:web && pnpm build:web` |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout, Compatibility, and Risks

No migration or flag is required. Rollback is a revert of these onboarding-only files; payload shape, API, persistence, and backend remain compatible. Risks are client clock inaccuracy (backend still authoritative), browser-native date behavior (independent validation), and midnight/DST disagreement (single fresh boundary plus deterministic tests). No generic abstraction or product-routing import is permitted.

## Open Questions

None. The passive-midnight display ambiguity is resolved by boundary refresh on focus/Continue, with mandatory pre-request revalidation.
