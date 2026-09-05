"use client";

import { getBrowserSupabaseClient } from "../_infrastructure/supabase/browser";
import { isTestAuthAdapterEnabledInBrowser } from "../../../shared/testing/test-auth-adapter";

export type BrowserSignOutResult = { ok: true } | { ok: false };

type BrowserSignOutClient = {
	auth: {
		signOut(): Promise<{ error: unknown | null }>;
	};
};

type BrowserSignOutDependencies = {
	isTestAdapterEnabled(): boolean;
	consumeTestFailureSignal(): boolean;
	clearTestSession(): void;
	getBrowserClient(): BrowserSignOutClient | undefined;
};

const TEST_SIGN_OUT_FAILURE_HASH = "#kaito-e2e-sign-out-fail-once";

function clearTestSession(): void {
	document.cookie = "kaito-e2e-session=; Path=/; Max-Age=0; SameSite=Lax";
}

function consumeTestSignOutFailureSignal(): boolean {
	if (
		typeof window === "undefined" ||
		window.location.hash !== TEST_SIGN_OUT_FAILURE_HASH
	) {
		return false;
	}

	window.history.replaceState(
		null,
		"",
		`${window.location.pathname}${window.location.search}`,
	);
	return true;
}

export function createBrowserSignOutAdapter({
	isTestAdapterEnabled = isTestAuthAdapterEnabledInBrowser,
	consumeTestFailureSignal = consumeTestSignOutFailureSignal,
	clearTestSession: clearSession = clearTestSession,
	getBrowserClient = getBrowserSupabaseClient,
}: Partial<BrowserSignOutDependencies> = {}) {
	return async (): Promise<BrowserSignOutResult> => {
		if (isTestAdapterEnabled()) {
			if (consumeTestFailureSignal()) return { ok: false };
			clearSession();
			return { ok: true };
		}

		const client = getBrowserClient();
		if (!client) return { ok: false };

		const { error } = await client.auth.signOut();
		return error ? { ok: false } : { ok: true };
	};
}

export const browserSignOut = createBrowserSignOutAdapter();
