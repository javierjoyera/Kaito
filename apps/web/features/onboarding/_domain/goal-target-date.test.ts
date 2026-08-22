import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import {
	madridDateBoundary,
	validateGoalTargetDate,
} from "./goal-target-date";

describe("goal target date", () => {
	test("rejects malformed, impossible, non-leap, and year-zero values", () => {
		for (const value of ["2026-2-01", "2026-02-30", "2025-02-29", "0000-01-01"]) {
			assert.equal(validateGoalTargetDate(value, "2026-08-01"), "invalid_date");
		}
		assert.equal(validateGoalTargetDate("2024-02-29", "2024-02-01"), null);
	});

	test("requires a canonical date strictly after Madrid today", () => {
		assert.equal(validateGoalTargetDate("2026-07-31", "2026-08-01"), "not_future");
		assert.equal(validateGoalTargetDate("2026-08-01", "2026-08-01"), "not_future");
		assert.equal(validateGoalTargetDate("2026-08-02", "2026-08-01"), null);
	});

	test("uses Madrid rather than UTC and preserves strict-future validation across DST boundaries", () => {
		let clockCalls = 0;
		assert.deepEqual(madridDateBoundary(() => {
			clockCalls += 1;
			return new Date("2030-01-01T23:30:00.000Z");
		}), {
			today: "2030-01-02",
			tomorrow: "2030-01-03",
		});
		assert.equal(clockCalls, 1);

		for (const [instant, madridToday] of [
			["2030-03-31T00:30:00.000Z", "2030-03-31"],
			["2030-03-31T01:30:00.000Z", "2030-03-31"],
			["2030-10-27T00:30:00.000Z", "2030-10-27"],
			["2030-10-27T01:30:00.000Z", "2030-10-27"],
		] as const) {
			const boundary = madridDateBoundary(() => new Date(instant));
			assert.equal(boundary.today, madridToday);
			assert.equal(validateGoalTargetDate(boundary.today, boundary.today), "not_future");
			assert.equal(validateGoalTargetDate(boundary.tomorrow, boundary.today), null);
		}
	});
});
