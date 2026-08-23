# Delta for Onboarding Goal Date Validation

## MODIFIED Requirements

### Requirement: Validate a canonical future Madrid date

The system MUST recalculate the current `Europe/Madrid` date at validation and submission boundaries. It MUST accept only an existent canonical `YYYY-MM-DD` target strictly later than that date, independent of browser timezone.
(Previously: runtime evidence missed browser/UTC disagreement and DST strict-future behavior.)

#### Scenario: Past and today are rejected
- GIVEN Madrid today is `2026-08-01`
- WHEN the target is `2026-07-31` or `2026-08-01`
- THEN validation rejects it as non-future

#### Scenario: Tomorrow and later dates pass
- GIVEN Madrid today is `2026-08-01`
- WHEN the target is `2026-08-02` or later
- THEN validation accepts it as future

#### Scenario: Malformed or impossible dates are rejected
- GIVEN the target is non-canonical or impossible, such as `2026-02-30`
- WHEN validation occurs
- THEN validation rejects it as invalid/nonexistent

#### Scenario: Madrid governs browser-boundary dates
- GIVEN browser/UTC date and Madrid date differ at the same instant
- WHEN validation runs
- THEN the result uses Madrid’s date and remains unchanged by browser timezone

#### Scenario: DST preserves strict-future semantics
- GIVEN validation runs immediately around both Madrid DST transitions
- WHEN a target is compared
- THEN the extracted Madrid date and strict-future result are correct

### Requirement: Provide persistent, accessible correction guidance

The system MUST expose the next `Europe/Madrid` date as the target input’s minimum and persistent guidance. It MUST independently enforce the rule, distinguish invalid from non-future values, and expose complete invalid-state semantics.
(Previously: tests accepted any date-shaped minimum and missed complete guidance/error association.)

#### Scenario: Minimum and guidance identify Madrid tomorrow
- GIVEN Madrid today is `2026-08-01`
- WHEN the goal field renders
- THEN `min` is `2026-08-02` and persistent guidance contains `2026-08-02`

#### Scenario: Invalid feedback is fully announced
- GIVEN the rendered field contains guidance and receives a rejected value
- WHEN validation rejects it
- THEN `aria-invalid="true"`, `aria-describedby` references guidance and error, and the error has alert semantics

#### Scenario: Rejected values are preserved
- GIVEN a user entered a rejected target date
- WHEN validation rejects it
- THEN the displayed value is unchanged and is not auto-adjusted

### Requirement: Gate progression without changing the request contract

The system MUST recalculate Madrid today immediately before validation and again before every onboarding `PUT`. It MUST revalidate against the submission capture, block invalid or non-future values without a request, preserve the value, and retain `{ snapshot, validation_date }`.
(Previously: one capture was reused for submission, leaving Madrid-midnight rollover unproved.)

#### Scenario: Midnight rollover blocks a formerly valid value
- GIVEN a target was future before Madrid midnight and equals Madrid today after midnight
- WHEN the user continues or submits
- THEN progression is blocked, the value is preserved, and no `PUT` occurs

#### Scenario: Valid flow remains unchanged
- GIVEN a canonical existent target is later than freshly captured Madrid today
- WHEN onboarding completes
- THEN one request uses `{ snapshot, validation_date }`, with `validation_date` equal to that fresh Madrid date

#### Scenario: Client rejection prevents a request
- GIVEN the target fails calendar-validity or strict-future validation
- WHEN the user continues or submits
- THEN no progression or onboarding request occurs until correction

## ADDED Requirements

### Requirement: Maintain durable verification evidence

Strict TDD evidence MUST report only scenarios directly demonstrated by runtime assertions. Date fixtures MUST remain future relative to an explicit test reference boundary.

#### Scenario: Evidence matches executable coverage
- GIVEN a verification report claims a scenario is covered
- WHEN the focused unit or Playwright suite runs
- THEN a runtime assertion demonstrates it; otherwise the claim is absent

#### Scenario: Fixtures remain non-expiring
- GIVEN tests run after the original fixture dates would have passed
- WHEN date validation and onboarding regression suites run
- THEN fixtures remain future under that boundary and unrelated flows still pass
