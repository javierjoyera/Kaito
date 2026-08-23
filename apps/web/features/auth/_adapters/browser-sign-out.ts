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
	clearTestSession(): void;
	getBrowserClient(): BrowserSignOutClient | undefined;
};

function clearTestSession(): void {
	document.cookie = "kaito-e2e-session=; Path=/; Max-Age=0; SameSite=Lax";
}

export function createBrowserSignOutAdapter({
	isTestAdapterEnabled = isTestAuthAdapterEnabledInBrowser,
	clearTestSession: clearSession = clearTestSession,
	getBrowserClient = getBrowserSupabaseClient,
}: Partial<BrowserSignOutDependencies> = {}) {
	return async (): Promise<BrowserSignOutResult> => {
		if (isTestAdapterEnabled()) {
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
