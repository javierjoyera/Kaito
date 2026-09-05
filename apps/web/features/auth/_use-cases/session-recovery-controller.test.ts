import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSessionRecoveryController } from "./session-recovery-controller";

describe("createSessionRecoveryController", () => {
	it("does nothing until the user explicitly recovers an authentication failure", async () => {
		const calls: string[] = [];
		const controller = createSessionRecoveryController({
			currentPath: "/training?week=2",
			signOut: async () => {
				calls.push("sign-out");
			},
			replace: (destination) => calls.push(destination),
		});
		assert.deepEqual(calls, []);
		await controller.recover("auth_rejected");
		assert.deepEqual(calls, [
			"sign-out",
			"/login?returnTo=%2Ftraining%3Fweek%3D2",
		]);
	});
	it("still redirects auth_required recovery when sign-out rejects", async () => {
		const calls: string[] = [];
		const controller = createSessionRecoveryController({
			currentPath: "/training",
			signOut: async () => {
				throw new Error("provider failure");
			},
			replace: (destination) => calls.push(destination),
		});
		await controller.recover("auth_required");
		assert.deepEqual(calls, ["/login?returnTo=%2Ftraining"]);
	});

	it("still redirects auth_rejected recovery to its selected destination when sign-out rejects", async () => {
		const calls: string[] = [];
		const controller = createSessionRecoveryController({
			currentPath: "/plan/generating?plan_id=next",
			signOut: async () => {
				throw new Error("provider failure");
			},
			replace: (destination) => calls.push(destination),
		});

		await controller.recover("auth_rejected");

		assert.deepEqual(calls, [
			"/login?returnTo=%2Fplan%2Fgenerating%3Fplan_id%3Dnext",
		]);
	});

	it("does not clear a session or navigate for a system-unavailable failure", async () => {
		const calls: string[] = [];
		const controller = createSessionRecoveryController({
			currentPath: "https://attacker.example",
			signOut: async () => {
				calls.push("sign-out");
			},
			replace: (destination) => calls.push(destination),
		});
		await controller.recover("auth_unavailable");
		assert.deepEqual(calls, []);
	});
});
