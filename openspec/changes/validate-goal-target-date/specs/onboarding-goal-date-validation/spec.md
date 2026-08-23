# Onboarding Goal Date Validation Specification

## Purpose

Define issue #119 onboarding behavior for future goal target dates by `Europe/Madrid` calendar date.

## Requirements

### Requirement: Validate a canonical future Madrid date

The system MUST recalculate the current `Europe/Madrid` calendar date whenever validation or submission occurs. It MUST accept only an existent, canonical `YYYY-MM-DD` target date strictly later than that date, independent of browser timezone.

#### Scenario: Past and today are rejected

- GIVEN Madrid today is `2026-08-01`
- WHEN the target date is `2026-07-31` or `2026-08-01`
- THEN validation rejects it as valid-but-not-future

#### Scenario: Tomorrow and later dates pass

- GIVEN Madrid today is `2026-08-01`
- WHEN the target date is `2026-08-02` or later
- THEN validation accepts it as a future date

#### Scenario: Malformed or impossible dates are rejected

- GIVEN a target value is not canonical `YYYY-MM-DD`, or represents no real calendar date such as `2026-02-30`
- WHEN validation occurs
- THEN validation rejects it as invalid/nonexistent, not as merely non-future

#### Scenario: Madrid governs browser-boundary dates

- GIVEN the browser’s local calendar date differs from Madrid’s date at the same instant
- WHEN validation or submission occurs
- THEN the result uses Madrid’s date and is not changed by the browser timezone

#### Scenario: DST does not alter date semantics

- GIVEN validation or submission occurs at an instant adjacent to a `Europe/Madrid` daylight-saving transition
- WHEN the target is compared
- THEN the extracted Madrid calendar date and strict-future result remain correct

### Requirement: Provide persistent, accessible correction guidance

The system MUST expose tomorrow’s Madrid date as the target input’s minimum and independently enforce the same rule when native `min` behavior is unavailable or bypassed. Guidance MUST remain available while rendered, and feedback MUST distinguish invalid/nonexistent dates from valid-but-not-future dates.

#### Scenario: Minimum and guidance identify the earliest valid date

- GIVEN Madrid today is `2026-08-01`
- WHEN the goal field is rendered
- THEN its minimum is `2026-08-02` and guidance explains that the date must be after Madrid today

#### Scenario: Guidance and errors are announced through the field

- GIVEN the field has persistent guidance and may have a validation error
- WHEN the field is rendered or becomes invalid
- THEN the input is associated with the guidance and current error text, and invalid feedback is exposed through the existing accessible inline-feedback behavior

#### Scenario: Rejected values are preserved

- GIVEN a user selected or entered a rejected target date
- WHEN validation rejects it
- THEN the displayed value remains unchanged and the system does not auto-adjust it

### Requirement: Gate progression without changing the request contract

The system MUST recalculate Madrid today immediately before each validation and submission boundary. It MUST block progression and submission when the current value is invalid or not strictly future, while preserving the value and explaining the correction. Accepted values MUST continue through the existing backend request contract; backend validation remains authoritative.

#### Scenario: Midnight rollover blocks a formerly valid value

- GIVEN a selected date was future before Madrid midnight but equals Madrid today after midnight
- WHEN the user attempts to continue or submit
- THEN progression is blocked, the value is preserved, and the user is told to choose a later date

#### Scenario: Valid flow remains unchanged

- GIVEN a canonical existent target date is later than freshly calculated Madrid today
- WHEN the user continues or completes onboarding
- THEN progression/submission uses the existing request contract without changing backend rules or payload semantics

#### Scenario: Client rejection prevents a request

- GIVEN the target date fails either calendar-validity or strict-future validation
- WHEN the user attempts to continue or submit
- THEN no progression or onboarding request occurs until the value is corrected

## Non-Goals

This change does not modify backend validation rules, the request contract, persistence, logout, shared date abstractions, or behavior outside GitHub issue #119.
