import assert from "node:assert/strict";
import { it } from "node:test";
import { act } from "react";
import type { ExplicitLogout } from "../_use-cases/explicit-logout";
import { LogoutControl } from "./logout-control";
import { withDomComponentTest } from "../../../shared/testing/dom-component-test-harness";

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolvePromise) => {
		resolve = resolvePromise;
	});
	return { promise, resolve };
}

it("renders a semantic logout button and exposes pending status during one in-flight attempt", { concurrency: false }, async () => {
	await withDomComponentTest(async ({ document, render, user }) => {
		const attempt = deferred<Awaited<ReturnType<ExplicitLogout>>>();
		let calls = 0;
		const logout: ExplicitLogout = async () => {
			calls += 1;
			return attempt.promise;
		};
		render(<LogoutControl logout={logout} onSuccess={() => undefined} />);

		const button = document.querySelector<HTMLButtonElement>("button");
		assert.ok(button);
		assert.equal(button.textContent, "Log out");
		await user.click(button);
		await user.click(button);

		assert.equal(calls, 1);
		assert.equal(button.disabled, true);
		assert.equal(button.getAttribute("aria-busy"), "true");
		assert.equal(document.querySelector('[role="status"]')?.textContent, "Logging out");

		await act(async () => attempt.resolve({ status: "success" }));
	});
});

it("starts the injected logout use case through keyboard activation", { concurrency: false }, async () => {
	await withDomComponentTest(async ({ document, render, user }) => {
		let calls = 0;
		const logout: ExplicitLogout = async () => {
			calls += 1;
			return { status: "success" };
		};
		render(<LogoutControl logout={logout} onSuccess={() => undefined} />);

		const button = document.querySelector<HTMLButtonElement>("button");
		assert.ok(button);
		button.focus();
		await user.keyboard("{Enter}");

		assert.equal(calls, 1);
		assert.equal(document.querySelector('[role="status"]')?.textContent, "Logged out");
	});
});

it("announces provider rejection and thrown errors, then focuses the retry path", { concurrency: false }, async () => {
	await withDomComponentTest(async ({ document, render, user }) => {
		let calls = 0;
		const logout: ExplicitLogout = async () => {
			calls += 1;
			if (calls === 1) return { status: "error" };
			throw new Error("provider unavailable");
		};
		render(<LogoutControl logout={logout} onSuccess={() => undefined} />);

		const button = document.querySelector<HTMLButtonElement>("button");
		assert.ok(button);
		await user.click(button);
		assert.equal(document.querySelector('[role="alert"]')?.textContent, "Unable to log out. Try again.");
		assert.equal(document.activeElement, button);

		await user.click(button);
		assert.equal(document.querySelector('[role="alert"]')?.textContent, "Unable to log out. Try again.");
		assert.equal(document.activeElement, button);
	});
});

it("retries after failure and reports success only after the injected use case succeeds", { concurrency: false }, async () => {
	await withDomComponentTest(async ({ document, render, user }) => {
		const outcomes = [{ status: "error" }, { status: "success" }] as const;
		let calls = 0;
		let successes = 0;
		const logout: ExplicitLogout = async () => outcomes[calls++]!;
		render(<LogoutControl logout={logout} onSuccess={() => (successes += 1)} />);

		const button = document.querySelector<HTMLButtonElement>("button");
		assert.ok(button);
		await user.click(button);
		await user.click(button);

		assert.equal(calls, 2);
		assert.equal(successes, 1);
		assert.equal(document.querySelector('[role="alert"]'), null);
		assert.equal(document.querySelector('[role="status"]')?.textContent, "Logged out");
	});
});
