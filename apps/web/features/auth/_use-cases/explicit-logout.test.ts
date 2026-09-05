import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createExplicitLogout } from "./explicit-logout";

describe("createExplicitLogout", () => {
	it("returns success when the provider reports a successful sign-out", async () => {
		const logout = createExplicitLogout(async () => ({ ok: true }));

		assert.deepEqual(await logout(), { status: "success" });
	});

	it("returns error when the provider rejects the sign-out", async () => {
		const logout = createExplicitLogout(async () => ({ ok: false }));

		assert.deepEqual(await logout(), { status: "error" });
	});

	it("maps each fresh provider outcome without exposing provider data", async () => {
		const results = [{ ok: false }, { ok: true }] as const;
		let attempt = 0;
		const logout = createExplicitLogout(async () => results[attempt++]);

		assert.deepEqual(await logout(), { status: "error" });
		assert.deepEqual(await logout(), { status: "success" });
	});

	it("returns error when the provider promise rejects", async () => {
		const logout = createExplicitLogout(async () => {
			throw new Error("provider rejection");
		});

		assert.deepEqual(await logout(), { status: "error" });
	});

	it("returns error when the provider throws before returning a promise", async () => {
		const logout = createExplicitLogout(() => {
			throw new Error("provider throw");
		});

		assert.deepEqual(await logout(), { status: "error" });
	});
});
