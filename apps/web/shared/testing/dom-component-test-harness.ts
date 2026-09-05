import globalJsdom from "global-jsdom";
import type { render as renderComponent } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";

type GlobalSnapshot = Map<PropertyKey, PropertyDescriptor>;

export type DomComponentTestContext = {
	document: Document;
	render: typeof renderComponent;
	user: ReturnType<typeof userEvent.setup>;
	window: Window;
};

export async function withDomComponentTest(
	callback: (context: DomComponentTestContext) => void | Promise<void>,
): Promise<void> {
	const globals = snapshotGlobals();
	const restoreDom = globalJsdom(undefined, {
		pretendToBeVisual: true,
		url: "http://127.0.0.1",
	});
	const window = globalThis.window;
	const document = globalThis.document;
	const reactActEnvironment = globalThis as typeof globalThis & {
		IS_REACT_ACT_ENVIRONMENT?: boolean;
	};
	reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
	let cleanup: (() => void) | undefined;

	try {
		const testingLibrary = await import("@testing-library/react");
		const { default: userEvent } = await import("@testing-library/user-event");
		cleanup = testingLibrary.cleanup;
		await callback({
			document,
			render: testingLibrary.render,
			user: userEvent.setup({ document }),
			window,
		});
	} finally {
		try {
			cleanup?.();
		} finally {
			restoreDom();
			window.close();
			restoreGlobals(globals);
		}
	}
}

function snapshotGlobals(): GlobalSnapshot {
	return new Map(
		Reflect.ownKeys(globalThis).flatMap((key) => {
			const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
			return descriptor ? [[key, descriptor] as const] : [];
		}),
	);
}

function restoreGlobals(snapshot: GlobalSnapshot): void {
	for (const key of Reflect.ownKeys(globalThis)) {
		if (!snapshot.has(key)) Reflect.deleteProperty(globalThis, key);
	}

	for (const [key, descriptor] of snapshot) {
		const current = Object.getOwnPropertyDescriptor(globalThis, key);
		if (!sameDescriptor(current, descriptor)) {
			Object.defineProperty(globalThis, key, descriptor);
		}
	}
}

function sameDescriptor(
	left: PropertyDescriptor | undefined,
	right: PropertyDescriptor,
): boolean {
	if (!left) return false;

	return (
		left.configurable === right.configurable &&
		left.enumerable === right.enumerable &&
		left.writable === right.writable &&
		Object.is(left.value, right.value) &&
		left.get === right.get &&
		left.set === right.set
	);
}
