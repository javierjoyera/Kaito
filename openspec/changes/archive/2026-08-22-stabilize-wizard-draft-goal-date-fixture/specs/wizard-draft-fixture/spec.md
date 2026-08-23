# Wizard Draft Test-Fixture Durability Specification

## Purpose

Keep wizard-draft navigation tests focused on navigation rather than expiring date data when run under the explicit 2031 clock.

## Requirements

### Requirement: Keep the shared draft goal date future-valid

The shared `completeDraft.goal.target_date` fixture in `apps/web/features/onboarding/_domain/wizard-draft.test.ts` MUST remain a canonical `YYYY-MM-DD` date strictly later than the explicit 2031 test clock boundary (`2031-01-01`).

#### Scenario: Fixture remains future under the 2031 clock

- GIVEN the test clock is explicitly set to `2031-01-01T12:00:00.000Z`
- WHEN wizard-draft tests validate `completeDraft`
- THEN `completeDraft.goal.target_date` is canonical and strictly later than `2031-01-01`

#### Scenario: Navigation assertions remain unchanged

- GIVEN the durable shared fixture is used by the wizard-draft navigation tests
- WHEN the focused wizard-draft suite runs
- THEN existing navigation assertions and tested calls remain unchanged and pass

### Requirement: Enforce the fixture-only scope guard

The change MUST be limited to the shared `completeDraft.goal.target_date` fixture in `apps/web/features/onboarding/_domain/wizard-draft.test.ts`. It MUST NOT modify production code, navigation assertions, request contracts, backend/API behavior, prior changes, or unrelated tests and files.

#### Scenario: Focused and regression suites pass without scope expansion

- GIVEN only the canonical shared fixture is stabilized
- WHEN the focused suite and `pnpm test:web-onboarding` run
- THEN both suites pass with no production or unrelated file changes
