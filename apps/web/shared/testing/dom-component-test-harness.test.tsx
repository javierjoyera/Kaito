import assert from "node:assert/strict";
import { it } from "node:test";
import { useEffect } from "react";
import { withDomComponentTest } from "./dom-component-test-harness";

function restoreGlobal(name: string, descriptor?: PropertyDescriptor): void {
	if (descriptor) {
		Object.defineProperty(globalThis, name, descriptor);
	} else {
		Reflect.deleteProperty(globalThis, name);
	}
}

it("creates an isolated loopback DOM with body, focus, storage, and bound user events", { concurrency: false }, async () => {
	let firstWindow: Window;

	await withDomComponentTest(async ({ document, render, user, window }) => {
		firstWindow = window;
		render(
			<label>
				Name <input aria-label="Name" />
			</label>,
		);

		const input = document.querySelector("input");
		assert.ok(input);
		await user.click(input);
		await user.type(input, "Kaito");
		assert.equal(document.activeElement, input);
		assert.equal(input.value, "Kaito");
		window.localStorage.setItem("session", "isolated");
		assert.equal(window.location.origin, "http://127.0.0.1");
	});

	await withDomComponentTest(({ document, window }) => {
		assert.equal(document.body.childElementCount, 0);
		assert.equal(window.localStorage.getItem("session"), null);
		assert.notEqual(window, firstWindow);
	});
});

it("cleans rendered roots and restores globals after a callback failure", { concurrency: false }, async () => {
	const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
	const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
	const originalAct = Object.getOwnPropertyDescriptor(
		globalThis,
		"IS_REACT_ACT_ENVIRONMENT",
	);
	let unmounted = false;
	Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
		configurable: true,
		value: false,
		writable: true,
	});

	try {
		await assert.rejects(
			withDomComponentTest(({ render }) => {
				render(<UnmountProbe onUnmount={() => (unmounted = true)} />);
				throw new Error("callback failure");
			}),
			/callback failure/,
		);

		assert.equal(unmounted, true);
		assert.deepEqual(
			Object.getOwnPropertyDescriptor(globalThis, "window"),
			originalWindow,
		);
		assert.deepEqual(
			Object.getOwnPropertyDescriptor(globalThis, "document"),
			originalDocument,
		);
		assert.equal(globalThis.IS_REACT_ACT_ENVIRONMENT, false);
	} finally {
		restoreGlobal("IS_REACT_ACT_ENVIRONMENT", originalAct);
	}
});

function UnmountProbe({ onUnmount }: { onUnmount(): void }) {
	useEffect(() => onUnmount, [onUnmount]);
	return <span>mounted</span>;
}
