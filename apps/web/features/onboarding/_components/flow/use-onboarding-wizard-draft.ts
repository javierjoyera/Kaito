import { useCallback, useState } from "react";

import {
	hydrateAvailability,
	reduceAvailability,
	toAvailabilityDraft,
	type AvailabilityAction,
	type AvailabilityInteractionState,
	type AvailabilityIssue,
} from "../../_domain/availability-model";
import {
	type BaselineDraft,
	type FieldErrors,
	type GoalDraft,
	type OnboardingSnapshotDraft,
	type PhysicalStatusDraft,
	type PriorHistoryDraft,
	type TrainingPreferencesDraft,
} from "../../_domain/step-validation";
import { createBlankWizardDraft } from "../../_domain/wizard-draft";

type WizardDraftState = {
	draft: OnboardingSnapshotDraft;
	availability: AvailabilityInteractionState;
};

function createWizardDraftState(
	draft: OnboardingSnapshotDraft,
): WizardDraftState {
	return {
		draft,
		availability: hydrateAvailability(
			draft.profile.availability?.minutes_by_day ?? {},
		),
	};
}

export function projectAvailability(
	draft: OnboardingSnapshotDraft,
	availability: AvailabilityInteractionState,
): OnboardingSnapshotDraft {
	return {
		...draft,
		profile: {
			...draft.profile,
			availability: toAvailabilityDraft(availability),
		},
	};
}

export function useOnboardingWizardDraft() {
	const [wizard, setWizard] = useState<WizardDraftState>(() =>
		createWizardDraftState(createBlankWizardDraft()),
	);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [availabilityIssues, setAvailabilityIssues] = useState<
		readonly AvailabilityIssue[]
	>([]);
	const setDraft = useCallback((draft: OnboardingSnapshotDraft) => {
		setWizard((current) => ({ ...current, draft }));
	}, []);
	const replaceDraft = useCallback((draft: OnboardingSnapshotDraft) => {
		setWizard(createWizardDraftState(draft));
	}, []);

	function updateDraft(
		update: (current: OnboardingSnapshotDraft) => OnboardingSnapshotDraft,
	) {
		setWizard((current) => ({ ...current, draft: update(current.draft) }));
	}

	function updateGoal(patch: Partial<GoalDraft>) {
		updateDraft((current) => ({
			...current,
			goal: { ...current.goal, ...patch },
		}));
	}

	function updatePriorHistory(patch: Partial<PriorHistoryDraft>) {
		updateDraft((current) => ({
			...current,
			profile: {
				...current.profile,
				prior_history: { ...current.profile.prior_history, ...patch },
			},
		}));
	}

	function updateBaseline(patch: Partial<BaselineDraft>) {
		updateDraft((current) => ({
			...current,
			profile: {
				...current.profile,
				baseline_4_weeks: {
					...current.profile.baseline_4_weeks,
					...patch,
				},
			},
		}));
	}

	function updateAvailability(action: AvailabilityAction) {
		setWizard((current) => {
			const availability = reduceAvailability(current.availability, action);
			return {
				availability,
				draft: projectAvailability(current.draft, availability),
			};
		});
		setAvailabilityIssues([]);
	}

	function updatePreferences(patch: Partial<TrainingPreferencesDraft>) {
		updateDraft((current) => ({
			...current,
			profile: {
				...current.profile,
				training_preferences: {
					...current.profile.training_preferences,
					...patch,
				},
			},
		}));
	}

	function updatePhysicalStatus(patch: Partial<PhysicalStatusDraft>) {
		updateDraft((current) => ({
			...current,
			profile: {
				...current.profile,
				physical_status: {
					...current.profile.physical_status,
					...patch,
				},
			},
		}));
	}

	return {
		draft: wizard.draft,
		availability: wizard.availability,
		fieldErrors,
		availabilityIssues,
		setDraft,
		replaceDraft,
		setFieldErrors,
		setAvailabilityIssues,
		updateGoal,
		updatePriorHistory,
		updateBaseline,
		updateAvailability,
		updatePreferences,
		updatePhysicalStatus,
	};
}
