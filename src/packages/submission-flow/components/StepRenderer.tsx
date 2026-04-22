import { ComponentType } from 'react';
import { FormStep } from '../steps/FormStep';
import { UploadStep } from '../steps/UploadStep';
import { ReviewStep } from '../steps/ReviewStep';
import { CustomStep } from '../steps/CustomStep';
import { FlowConfig, StepType } from '../types/config';
import { useFlowContext } from '../context/FlowContext';
import { useResolvedSteps } from '../hooks/useResolvedSteps';

interface StepRendererProps {
  config: FlowConfig;
}

const STEP_MAP = {
  form: FormStep,
  upload: UploadStep,
  review: ReviewStep,
  custom: CustomStep,
} satisfies Record<StepType, unknown>;

export function StepRenderer({ config }: StepRendererProps) {
  const { state } = useFlowContext();
  const resolvedSteps = useResolvedSteps(config.steps, state.flowData);
  const currentStep = resolvedSteps[state.currentStepIndex];

  if (!currentStep) {
    return null;
  }

  const Component = STEP_MAP[currentStep.type] as ComponentType<{
    step: typeof currentStep;
    config: FlowConfig;
    resolvedSteps: typeof resolvedSteps;
  }>;

  return (
    <div key={currentStep.id} className="animate-fadeIn transition-opacity duration-150">
      <Component step={currentStep} config={config} resolvedSteps={resolvedSteps} />
    </div>
  );
}
