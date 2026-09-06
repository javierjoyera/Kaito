"use client";

import { TrainingApproachChoice } from "../approach/training-approach-choice";
import { OnboardingStepContent } from "../steps/onboarding-step-content";
import { OnboardingStatusSurface } from "./onboarding-status-surface";
import { StepNavigator } from "./step-navigator";
import { useOnboardingWizardController } from "./use-onboarding-wizard-controller";

export function OnboardingWizard() {
	const controller = useOnboardingWizardController();

	if (controller.phase === "loading") {
		return (
			<OnboardingStatusSurface
				variant="loading"
				title="Preparando tu plan"
				description="Estamos recuperando tus respuestas para que puedas continuar donde lo dejaste."
			/>
		);
	}

	if (controller.phase === "load_error") {
		return (
			<OnboardingStatusSurface
				variant="error"
				title="No hemos podido cargar tus respuestas"
				description="Puede ser un problema de conexión. Tus datos siguen a salvo y puedes intentarlo de nuevo sin salir de esta página."
				action={{ label: "Reintentar", href: "/onboarding" }}
			/>
		);
	}

	if (controller.phase === "eligibility_loading") {
		return (
			<OnboardingStatusSurface
				variant="loading"
				title="Comprobando tus opciones"
				description="Estamos revisando qué enfoques están disponibles con tu situación actual."
			/>
		);
	}

	if (controller.phase === "eligibility_unsupported") {
		return (
			<section
				className="onboarding-status-surface onboarding-status-surface-error"
				role="alert"
			>
				<div className="onboarding-status-copy">
					<h1>Necesitamos revisar tu objetivo</h1>
					<p>
						Este tipo de prueba todavía no admite la selección de enfoque.
						Puedes actualizar tu objetivo para continuar.
					</p>
				</div>
				<button
					className="onboarding-status-action"
					type="button"
					onClick={controller.reviewGoal}
				>
					Revisar mi objetivo
				</button>
			</section>
		);
	}

	if (controller.phase === "eligibility_error") {
		return (
			<section
				className="onboarding-status-surface onboarding-status-surface-error"
				role="alert"
			>
				<div className="onboarding-status-copy">
					<h1>No hemos podido comprobar tus opciones</h1>
					<p>Tus respuestas siguen guardadas. Puedes volver a intentarlo aquí.</p>
				</div>
				<button
					className="onboarding-status-action"
					type="button"
					onClick={controller.retryEligibility}
				>
					Reintentar
				</button>
			</section>
		);
	}

	if (controller.phase === "choice" && controller.approach.assessment) {
		return (
			<TrainingApproachChoice
				assessment={controller.approach.assessment}
				selected={controller.approach.selected}
				pending={controller.approach.pending}
				error={controller.approach.error}
				onSelect={controller.approach.select}
				onSubmit={controller.approach.submit}
			/>
		);
	}

	const { step } = controller;
	const nextButtonLabel =
		step.saveStatus === "saving" ? "Guardando…" : "Continuar";

	return (
		<div className="onboarding-wizard">
			<StepNavigator currentStepIndex={step.index} />
			<OnboardingStepContent
				stepId={step.definition.id}
				draft={step.draft}
				errors={step.fieldErrors}
				minimumTargetDate={step.minimumTargetDate}
				onGoalChange={step.updateGoal}
				onTargetDateFocus={step.refreshTargetDate}
				onPriorHistoryChange={step.updatePriorHistory}
				onBaselineChange={step.updateBaseline}
				availability={step.availability}
				availabilityIssues={step.availabilityIssues}
				onAvailabilityAction={step.updateAvailability}
				onPreferencesChange={step.updatePreferences}
				onPhysicalStatusChange={step.updatePhysicalStatus}
			>
				{step.saveStatus === "save_error" ? (
					<p className="onboarding-form-error" role="alert">
						No hemos podido guardar este paso. Revisa tu conexión e inténtalo de
						nuevo; tus respuestas no se han perdido.
					</p>
				) : null}

				<div className="onboarding-step-actions">
					{step.index > 0 ? (
						<button
							className="onboarding-back-action"
							type="button"
							disabled={step.saveStatus === "saving"}
							onClick={step.back}
						>
							<span aria-hidden="true">←</span> Atrás
						</button>
					) : null}
					<button
						className="onboarding-next-action"
						type="button"
						disabled={step.saveStatus === "saving"}
						onClick={step.next}
					>
						{nextButtonLabel} <span aria-hidden="true">→</span>
					</button>
				</div>
			</OnboardingStepContent>
		</div>
	);
}
