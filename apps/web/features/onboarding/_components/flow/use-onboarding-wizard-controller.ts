"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { browserSignOut } from "../../../auth/_adapters/browser-sign-out";
import { getAccessToken } from "../../../auth/_adapters/get-access-token";
import { createSessionRecoveryController } from "../../../auth/_use-cases/session-recovery-controller";
import { isTestAuthAdapterEnabledInBrowser } from "../../../../shared/testing/test-auth-adapter";
import type { OnboardingApiDependencies } from "../../_adapters/onboarding-api";
import {
	validateAvailabilityInteraction,
} from "../../_domain/availability-model";
import {
	madridDateBoundary,
	type MadridDateBoundary,
} from "../../_domain/goal-target-date";
import {
	type TrainingApproach,
	type TrainingApproachAssessment,
} from "../../_domain/training-approach-choice";
import {
	validateStep,
} from "../../_domain/step-validation";
import { ONBOARDING_STEPS } from "../../_domain/steps";
import {
	applyConditionalClearing,
	firstIncompleteStepIndex,
	normalizeWizardDraft,
	toDiagnosticsByField,
} from "../../_domain/wizard-draft";
import { completeOnboarding } from "../../_use-cases/complete-onboarding";
import { loadOnboardingDraft } from "../../_use-cases/load-onboarding-draft";
import { loadCurrentTrainingApproachEligibility } from "../../_use-cases/load-training-approach-eligibility";
import { saveOnboardingStep } from "../../_use-cases/save-onboarding-step";
import { saveTrainingPlanDraft } from "../../_use-cases/save-training-plan-draft";
import {
	projectAvailability,
	useOnboardingWizardDraft,
} from "./use-onboarding-wizard-draft";

export type OnboardingPhase =
	| "loading"
	| "ready"
	| "load_error"
	| "eligibility_loading"
	| "eligibility_error"
	| "eligibility_unsupported"
	| "choice";

export type OnboardingSaveStatus = "idle" | "saving" | "save_error";

function createApiDependencies(): OnboardingApiDependencies {
	return {
		apiBaseUrl: (process.env.NEXT_PUBLIC_KAITO_API_URL ?? "").trim(),
		getAccessToken: isTestAuthAdapterEnabledInBrowser()
			? async () => "test-access-token"
			: getAccessToken,
		fetcher: (input, init) => fetch(input, init),
	};
}

async function signOutBrowserSession(): Promise<void> {
	await browserSignOut();
}

export function useOnboardingWizardController() {
	const router = useRouter();
	const dependencies = useMemo(() => createApiDependencies(), []);
	const authRecovery = useMemo(
		() =>
			createSessionRecoveryController({
				currentPath: "/onboarding",
				signOut: signOutBrowserSession,
				replace: (destination) => router.replace(destination),
			}),
		[router],
	);
	const [dateBoundary, setDateBoundary] = useState<MadridDateBoundary>(() =>
		madridDateBoundary(),
	);
	const saveInFlight = useRef(false);
	const wizard = useOnboardingWizardDraft();
	const { replaceDraft } = wizard;
	const [phase, setPhase] = useState<OnboardingPhase>("loading");
	const [stepIndex, setStepIndex] = useState(0);
	const [saveStatus, setSaveStatus] =
		useState<OnboardingSaveStatus>("idle");
	const [assessment, setAssessment] =
		useState<TrainingApproachAssessment | null>(null);
	const [selectedApproach, setSelectedApproach] =
		useState<TrainingApproach | null>(null);
	const [draftError, setDraftError] = useState<string | null>(null);
	const [choicePending, setChoicePending] = useState(false);
	const [eligibilityAttempt, setEligibilityAttempt] = useState(0);
	const draft = wizard.draft;

	useEffect(() => {
		let cancelled = false;
		const boundary = madridDateBoundary();

		async function loadEligibility() {
			setPhase("eligibility_loading");
			const eligibility =
				await loadCurrentTrainingApproachEligibility(dependencies);
			if (cancelled) return;
			if (eligibility.status === "error") {
				setPhase(
					eligibility.reason === "unsupported"
						? "eligibility_unsupported"
						: "eligibility_error",
				);
				return;
			}
			setAssessment(eligibility.assessment);
			setPhase("choice");
		}

		loadOnboardingDraft(boundary.today, dependencies).then((outcome) => {
			if (cancelled) return;
			setDateBoundary(boundary);
			if (outcome.status === "error") {
				setPhase("load_error");
				return;
			}
			if (outcome.status === "blank") {
				setPhase("ready");
				return;
			}

			const loadedDraft = normalizeWizardDraft({
				profile: outcome.result.snapshot.profile,
				goal: outcome.result.snapshot.goal,
			});
			const loadedDiagnostics = toDiagnosticsByField(
				outcome.result.diagnostics,
			);
			replaceDraft(loadedDraft);

			if (outcome.result.snapshot.state === "completed") {
				void loadEligibility();
				return;
			}

			setStepIndex(firstIncompleteStepIndex(loadedDraft, loadedDiagnostics));
			setPhase("ready");
		});
		return () => {
			cancelled = true;
		};
	}, [dependencies, eligibilityAttempt, replaceDraft]);

	async function enterChoiceFlow() {
		setPhase("eligibility_loading");
		const eligibility =
			await loadCurrentTrainingApproachEligibility(dependencies);
		if (eligibility.status === "error") {
			setPhase(
				eligibility.reason === "unsupported"
					? "eligibility_unsupported"
					: "eligibility_error",
			);
			return;
		}
		setAssessment(eligibility.assessment);
		setPhase("choice");
	}

	async function handleApproachSubmit() {
		if (!selectedApproach || choicePending) return;
		setChoicePending(true);
		setDraftError(null);
		const outcome = await saveTrainingPlanDraft(
			selectedApproach,
			dependencies,
		);
		if (outcome.status === "success") {
			router.push(
				`/plan/generating?plan_id=${encodeURIComponent(outcome.draft.plan_id)}`,
			);
			return;
		}
		setChoicePending(false);
		switch (outcome.reason) {
			case "auth_required":
			case "auth_rejected":
				await authRecovery.recover(outcome.reason);
				return;
			case "blocked":
			case "stale":
				setSelectedApproach(null);
				await enterChoiceFlow();
				return;
			case "unsupported":
				setSelectedApproach(null);
				setPhase("eligibility_unsupported");
				return;
			case "onboarding_missing":
			case "onboarding_incomplete":
				setSelectedApproach(null);
				setPhase("loading");
				setEligibilityAttempt((value) => value + 1);
				return;
			case "conflict":
				setDraftError(
					"Tu plan ya no se puede modificar. Actualiza la página para continuar con su estado actual.",
				);
				return;
			case "unavailable":
				setDraftError(
					"No hemos podido guardar tu elección. Revisa tu conexión e inténtalo de nuevo.",
				);
		}
	}

	function handleBack() {
		setStepIndex((current) => Math.max(0, current - 1));
		wizard.setFieldErrors({});
		wizard.setAvailabilityIssues([]);
		setSaveStatus("idle");
	}

	async function handleNext() {
		if (saveInFlight.current) return;
		const boundary = madridDateBoundary();
		setDateBoundary(boundary);
		const currentStep = ONBOARDING_STEPS[stepIndex];
		const issues =
			currentStep.id === "availability"
				? validateAvailabilityInteraction(wizard.availability)
				: [];
		if (issues.length > 0) {
			wizard.setAvailabilityIssues(issues);
			wizard.setFieldErrors({});
			return;
		}

		const validationDraft =
			currentStep.id === "availability"
				? projectAvailability(draft, wizard.availability)
				: draft;
		const errors = validateStep(
			currentStep.id,
			validationDraft,
			boundary.today,
		);
		wizard.setFieldErrors(errors);
		if (Object.keys(errors).length > 0) return;
		const goalErrors = validateStep("goal", validationDraft, boundary.today);
		if (Object.keys(goalErrors).length > 0) {
			setStepIndex(0);
			wizard.setFieldErrors(goalErrors);
			return;
		}

		const cleared = applyConditionalClearing(validationDraft);
		wizard.setDraft(cleared);
		const submissionBoundary = madridDateBoundary();
		setDateBoundary(submissionBoundary);
		const submissionGoalErrors = validateStep(
			"goal",
			cleared,
			submissionBoundary.today,
		);
		if (Object.keys(submissionGoalErrors).length > 0) {
			setStepIndex(0);
			wizard.setFieldErrors(submissionGoalErrors);
			return;
		}

		const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;
		saveInFlight.current = true;
		setSaveStatus("saving");
		const outcome = isLastStep
			? await completeOnboarding(
					cleared,
					submissionBoundary.today,
					dependencies,
				)
			: await saveOnboardingStep(
					cleared,
					submissionBoundary.today,
					dependencies,
				);
		saveInFlight.current = false;

		if (outcome.status === "error") {
			setSaveStatus("save_error");
			return;
		}
		setSaveStatus("idle");

		if (outcome.status === "completed") {
			await enterChoiceFlow();
			return;
		}
		if (outcome.status === "demoted") {
			setStepIndex(
				firstIncompleteStepIndex(
					cleared,
					toDiagnosticsByField(outcome.result.diagnostics),
				),
			);
			wizard.setFieldErrors({});
			return;
		}

		setStepIndex(stepIndex + 1);
		wizard.setFieldErrors({});
		wizard.setAvailabilityIssues([]);
	}

	return {
		phase,
		approach: {
			assessment,
			selected: selectedApproach,
			pending: choicePending,
			error: draftError,
			select(nextApproach: TrainingApproach) {
				setSelectedApproach(nextApproach);
				setDraftError(null);
			},
			submit: handleApproachSubmit,
		},
		step: {
			index: stepIndex,
			definition: ONBOARDING_STEPS[stepIndex],
			draft,
			availability: wizard.availability,
			availabilityIssues: wizard.availabilityIssues,
			fieldErrors: wizard.fieldErrors,
			minimumTargetDate: dateBoundary.tomorrow,
			saveStatus,
			updateGoal: wizard.updateGoal,
			refreshTargetDate: () => setDateBoundary(madridDateBoundary()),
			updatePriorHistory: wizard.updatePriorHistory,
			updateBaseline: wizard.updateBaseline,
			updateAvailability: wizard.updateAvailability,
			updatePreferences: wizard.updatePreferences,
			updatePhysicalStatus: wizard.updatePhysicalStatus,
			back: handleBack,
			next: handleNext,
		},
		reviewGoal() {
			setStepIndex(0);
			setPhase("ready");
		},
		retryEligibility() {
			setEligibilityAttempt((value) => value + 1);
		},
	};
}
