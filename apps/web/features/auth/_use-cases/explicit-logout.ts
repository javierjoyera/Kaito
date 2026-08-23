export type ProviderSignOutResult = { ok: true } | { ok: false };

export type ProviderSignOutAdapter = () => Promise<ProviderSignOutResult>;

export type LogoutOutcome = { status: "success" } | { status: "error" };

export type ExplicitLogout = () => Promise<LogoutOutcome>;

export function createExplicitLogout(
	signOut: ProviderSignOutAdapter,
): ExplicitLogout {
	return async () => {
		try {
			const result = await signOut();
			return result.ok ? { status: "success" } : { status: "error" };
		} catch {
			return { status: "error" };
		}
	};
}
