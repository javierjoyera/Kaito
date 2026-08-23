# Explicit Logout Specification

## Purpose

Provide accessible logout from `/plan` without expanding to excluded surfaces or coupling behavior to a provider.

## Requirements

### Requirement: Dashboard-only logout control

The system MUST render a visible, keyboard-accessible logout control at the bottom of `/plan`, and MUST NOT render it on `/onboarding` or `/plan/generating`. This prevents unsupported coverage.

#### Scenario: Control is limited to the approved surface

- GIVEN an authenticated user visits `/plan`
- WHEN the dashboard renders
- THEN one discoverable logout control is available at the bottom
- AND excluded surfaces do not receive it

#### Scenario: Keyboard activation

- GIVEN the logout control is focused
- WHEN the user activates it with the keyboard
- THEN the same logout operation starts as for pointer activation

### Requirement: Single-flight pending behavior

The system MUST expose a pending state and perform at most one sign-out operation until it settles. This prevents duplicate calls.

#### Scenario: Double activation

- GIVEN logout is pending
- WHEN the user activates the control again
- THEN the second activation has no effect
- AND a sign-out operation is in flight

#### Scenario: Pending state is observable

- GIVEN the user has activated logout
- WHEN sign-out is unresolved
- THEN the control communicates pending and does not imply success

### Requirement: Confirmed success removes private access

The system MUST fully navigate or reload to `/login` only after logout confirms success. After success, back, refresh, and direct private navigation MUST reveal no private content.

#### Scenario: Successful logout

- GIVEN the user is on `/plan` and sign-out succeeds
- WHEN success is confirmed
- THEN the browser fully loads `/login`
- AND navigation occurs once

#### Scenario: Private history cannot restore content

- GIVEN logout succeeded
- WHEN the user goes back, refreshes, or opens a private route
- THEN no private content is revealed

### Requirement: Provider failure remains retryable

The system MUST remain on `/plan` when sign-out fails or throws, announce accessible feedback, not claim success, and return to a retryable state. This prevents false confirmation; like a race finish confirmation, completion follows timing confirmation.

#### Scenario: Provider rejection or throw

- GIVEN the user activates logout
- WHEN the provider adapter rejects or throws
- THEN the user remains on `/plan`
- AND an accessible error is announced without a success announcement
- AND retry is safe

#### Scenario: Retry succeeds

- GIVEN a previous logout attempt failed
- WHEN the user activates the available retry and sign-out succeeds
- THEN the pending and error state resolve
- AND the browser fully loads `/login` once

### Requirement: Provider-neutral and recovery-safe boundary

The UI and use-case contract MUST remain provider-neutral; Supabase and E2E mechanics MUST stay behind adapters. Both adapters MUST produce equivalent outcomes. Invalid-session recovery MUST retain best-effort semantics, including redirect after sign-out failure.

#### Scenario: Adapter equivalence

- GIVEN equivalent successful or failed sign-out outcomes from Supabase and E2E adapters
- WHEN the same UI/use-case contract consumes either adapter
- THEN pending, success, failure, retry, and navigation behavior is equivalent

#### Scenario: Invalid-session recovery regression

- GIVEN an invalid private session triggers automatic recovery
- WHEN the recovery sign-out attempt fails
- THEN recovery still performs its existing best-effort redirect
- AND explicit logout's confirmed-success semantics are not applied to recovery

### Requirement: Deterministic accessible status and focus

The system MUST communicate pending, success transition, and failure states through semantic, perceivable status—not color alone—and MUST provide deterministic focus behavior after a failed attempt so keyboard users can retry without searching the page.

#### Scenario: Failure focus and non-color status

- GIVEN a keyboard user receives a sign-out failure
- WHEN the failure state is rendered
- THEN the feedback is exposed through an appropriate accessible status or alert
- AND focus is placed deterministically on the retry path or documented error target
- AND status remains understandable without relying on color
