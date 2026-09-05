import { expect, test } from "@playwright/test";

const activePlan = {
	plan_approach: "mode_z",
	start_date: "2026-07-06",
	end_date: "2026-07-19",
	block_focus: "Durabilidad en montaña",
	weeks: [
		{
			week_number: 1,
			sessions: [
				{
					scheduled_date: "2026-07-08",
					session_type: "Recuperación activa",
					planned_duration_minutes: 30,
					planned_distance_kilometers: "5.00",
					planned_elevation_meters: 25,
					intensity_description: "Suave",
					target_rpe_min: 2,
					target_rpe_max: 3,
					instructions: "Mantén un ritmo cómodo.",
					purpose: "Construir constancia.",
				},
			],
		},
	],
};

async function authenticatePlanSession(page: import("@playwright/test").Page) {
	await page.context().addCookies([
		{
			name: "kaito-e2e-session",
			value: "authenticated",
			url: "http://127.0.0.1:3000",
		},
		{
			name: "kaito-e2e-product-state",
			value: "completed",
			url: "http://127.0.0.1:3000",
		},
	]);
	await page.route("http://127.0.0.1:9999/planning/active", (route) =>
		route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify(activePlan),
		}),
	);
}

test.describe("session route flow", () => {
	test("redirects anonymous onboarding requests without rendering private content", async ({
		page,
	}) => {
		await page.context().addCookies([
			{
				name: "kaito-e2e-session",
				value: "anonymous",
				url: "http://127.0.0.1:3000",
			},
		]);
		await page.goto("/onboarding?source=invite");

		await expect(page).toHaveURL(
			/\/login\?returnTo=%2Fonboarding%3Fsource%3Dinvite$/,
		);
		await expect(
			page.getByRole("heading", { name: /cuéntanos tu punto de partida/i }),
		).toHaveCount(0);
		await expect(page.getByText(/sesión caducó/i)).toHaveCount(0);
	});

	test("fails closed when Supabase configuration is unavailable", async ({
		page,
	}) => {
		await page.context().addCookies([
			{
				name: "kaito-e2e-session",
				value: "unavailable",
				url: "http://127.0.0.1:3000",
			},
		]);
		await page.goto("/onboarding");

		await expect(page).toHaveURL(
			/\/login\?returnTo=%2Fonboarding&context=auth_unavailable$/,
		);
		await expect(
			page.getByText(/no está disponible temporalmente/i),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: /cuéntanos tu punto de partida/i }),
		).toHaveCount(0);
	});

	test("shows an accessible loading boundary before delayed session resolution without private content", async ({
		page,
	}) => {
		await page.context().addCookies([
			{
				name: "kaito-e2e-session",
				value: "authenticated",
				url: "http://127.0.0.1:3000",
			},
			{
				name: "kaito-e2e-delay-session",
				value: "1",
				url: "http://127.0.0.1:3000",
			},
		]);
		await page.goto("/");
		const navigation = page.goto("/onboarding");

		await expect(page.getByRole("status")).toHaveText(/Preparando tu plan/i);
		await expect(
			page.getByRole("heading", { name: /cuéntanos tu punto de partida/i }),
		).toHaveCount(0);
		await navigation;
		await expect(
			page.getByRole("heading", {
				name: "Tu plan de entrenamiento, hecho a tu medida",
			}),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Crear mi plan" }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: /cuéntanos tu punto de partida/i }),
		).toHaveCount(0);
	});

	test("uses onboarding as the safe post-login handoff", async ({ page }) => {
		await page.goto("/login?returnTo=https://attacker.example");
		await page.getByLabel("Correo electrónico").fill("runner@example.com");
		await page.getByLabel("Contraseña").fill("trail-password");
		await page.getByRole("button", { name: "Iniciar sesión" }).click();

		await expect(page).toHaveURL("/onboarding");
		await expect(
			page.getByRole("heading", {
				name: "Tu plan de entrenamiento, hecho a tu medida",
			}),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Crear mi plan" }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: /cuéntanos tu punto de partida/i }),
		).toHaveCount(0);
	});

	test("renders bounded expiry context but not private content for an invalid session", async ({
		page,
	}) => {
		await page.context().addCookies([
			{
				name: "kaito-e2e-session",
				value: "invalid",
				url: "http://127.0.0.1:3000",
			},
		]);
		await page.goto("/onboarding");

		await expect(page).toHaveURL(
			/\/login\?returnTo=%2Fonboarding&context=session_expired$/,
		);
		await expect(page.getByText(/sesión.*caduc/i)).toBeVisible();
		await expect(
			page.getByRole("heading", { name: /cuéntanos tu punto de partida/i }),
		).toHaveCount(0);
	});

	test("fails logout once before removing private access through one confirmed navigation", async ({
		page,
	}) => {
		await authenticatePlanSession(page);
		await page.goto("/plan#kaito-e2e-sign-out-fail-once");

		const logoutButton = page.getByRole("button", { name: "Log out" });
		await expect(logoutButton).toBeVisible();
		await logoutButton.click();

		await expect(page).toHaveURL("/plan");
		await expect(page.getByText("Unable to log out. Try again.")).toBeVisible();
		await expect(page.getByRole("button", { name: "Try again" })).toBeFocused();
		expect(
			(await page.context().cookies()).some(
				(cookie) =>
					cookie.name === "kaito-e2e-session" && cookie.value === "authenticated",
			),
		).toBe(true);

		let loginNavigations = 0;
		page.on("framenavigated", (frame) => {
			if (frame === page.mainFrame() && new URL(frame.url()).pathname === "/login") {
				loginNavigations += 1;
			}
		});
		await page.getByRole("button", { name: "Try again" }).click();
		await expect(page).toHaveURL("/login");
		expect(loginNavigations).toBe(1);
		expect(
			(await page.context().cookies()).some(
				(cookie) => cookie.name === "kaito-e2e-session",
			),
		).toBe(false);

		await page.goBack();
		await expect(
			page.getByRole("heading", {
				name: "Tu plan de entrenamiento personalizado",
			}),
		).toHaveCount(0);
		await page.reload();
		await expect(
			page.getByRole("heading", {
				name: "Tu plan de entrenamiento personalizado",
			}),
		).toHaveCount(0);
		await page.goto("/plan");
		await expect(page).toHaveURL(
			/\/login\?returnTo=%2Fplan(?:&context=auth_unavailable)?$/,
		);
		await expect(
			page.getByRole("heading", {
				name: "Tu plan de entrenamiento personalizado",
			}),
		).toHaveCount(0);
	});

	test("hands an authenticated login visit to its safe return destination", async ({
		page,
	}) => {
		await page.context().addCookies([
			{
				name: "kaito-e2e-session",
				value: "authenticated",
				url: "http://127.0.0.1:3000",
			},
		]);
		await page.goto("/login?returnTo=/onboarding?step=1");

		await expect(page).toHaveURL("/onboarding?step=1");
	});
});
