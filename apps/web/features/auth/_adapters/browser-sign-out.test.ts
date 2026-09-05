import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBrowserSignOutAdapter } from "./browser-sign-out";

describe("createBrowserSignOutAdapter", () => {
	it("returns success after the gated E2E adapter clears the browser session", async () => {
		let cleared = false;
		const signOut = createBrowserSignOutAdapter({
			isTestAdapterEnabled: () => true,
			clearTestSession: () => {
				cleared = true;
			},
			getBrowserClient: () => undefined,
		});

		assert.deepEqual(await signOut(), { ok: true });
		assert.equal(cleared, true);
	});

	it("returns the same success outcome when Supabase signs out", async () => {
		let calls = 0;
		const signOut = createBrowserSignOutAdapter({
			isTestAdapterEnabled: () => false,
			getBrowserClient: () => ({
				auth: {
					signOut: async () => {
						calls += 1;
						return { error: null };
					},
				},
			}),
		});

		assert.deepEqual(await signOut(), { ok: true });
		assert.equal(calls, 1);
	});

	it("does not call Supabase while the gated E2E adapter is enabled", async () => {
		let clientRequested = false;
		const signOut = createBrowserSignOutAdapter({
			isTestAdapterEnabled: () => true,
			clearTestSession: () => undefined,
			getBrowserClient: () => {
				clientRequested = true;
				return undefined;
			},
		});

		assert.deepEqual(await signOut(), { ok: true });
		assert.equal(clientRequested, false);
	});

	it("returns failure when the browser client is unavailable", async () => {
		const signOut = createBrowserSignOutAdapter({
			isTestAdapterEnabled: () => false,
			getBrowserClient: () => undefined,
		});

		assert.deepEqual(await signOut(), { ok: false });
	});

	it("returns failure when Supabase reports an error", async () => {
		const signOut = createBrowserSignOutAdapter({
			isTestAdapterEnabled: () => false,
			getBrowserClient: () => ({
				auth: { signOut: async () => ({ error: new Error("provider failure") }) },
			}),
		});

		assert.deepEqual(await signOut(), { ok: false });
	});
});
