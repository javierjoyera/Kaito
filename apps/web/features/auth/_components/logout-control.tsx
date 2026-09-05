"use client";

import { useEffect, useRef, useState } from "react";
import type { ExplicitLogout } from "../_use-cases/explicit-logout";

type LogoutControlProps = {
	logout: ExplicitLogout;
	onSuccess(): void;
};

type LogoutState = "idle" | "pending" | "error" | "success";

export function LogoutControl({ logout, onSuccess }: LogoutControlProps) {
	const [state, setState] = useState<LogoutState>("idle");
	const inFlight = useRef(false);
	const retryButton = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (state === "error") retryButton.current?.focus();
	}, [state]);

	async function handleLogout(): Promise<void> {
		if (inFlight.current) return;

		inFlight.current = true;
		setState("pending");
		try {
			const outcome = await logout();
			if (outcome.status === "success") {
				setState("success");
				onSuccess();
			} else {
				setState("error");
			}
		} catch {
			setState("error");
		} finally {
			inFlight.current = false;
		}
	}

	const pending = state === "pending";
	const failed = state === "error";

	return (
		<div>
			<button
				aria-busy={pending}
				disabled={pending}
				onClick={handleLogout}
				ref={retryButton}
				type="button"
			>
				{failed ? "Try again" : "Log out"}
			</button>
			{pending ? <p role="status">Logging out</p> : null}
			{failed ? <p role="alert">Unable to log out. Try again.</p> : null}
			{state === "success" ? <p role="status">Logged out</p> : null}
		</div>
	);
}
