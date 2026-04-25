import { StepConfig } from '../types/config';
import { useFlowContext } from '../context/FlowContext';

interface StepperProps {
  steps: StepConfig[];
}

export function Stepper({ steps }: StepperProps) {
  const { state } = useFlowContext();
  const currentStep = steps[state.currentStepIndex];

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-gray-200/90 bg-white/95 p-4 text-sm text-gray-700 shadow-sm sm:hidden">
        <p className="font-medium">
          Step {state.currentStepIndex + 1} of {steps.length}
        </p>
        <p className="mt-1.5 truncate text-brand-light">{currentStep?.title}</p>
      </div>

      <div className="hidden rounded-2xl border border-gray-200/90 bg-white/95 px-5 py-4 shadow-sm sm:flex sm:items-start sm:justify-between">
        {steps.map((step, index) => {
          const isActive = index === state.currentStepIndex;
          const isComplete = state.stepStatus[step.id] === 'complete' || index < state.currentStepIndex;
          const isInvalid = state.stepStatus[step.id] === 'invalid';

          return (
            <div key={step.id} className="flex flex-1 items-start">
              <div className="flex w-full flex-col items-center">
                <div
                  className={[
                    'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-200',
                    isComplete && 'border-brand bg-brand text-white',
                    isActive && !isComplete && 'border-brand bg-brand text-white ring-4 ring-brand-light/25',
                    !isActive && !isComplete && !isInvalid && 'border-gray-300 bg-white text-gray-500',
                    isInvalid && 'border-red-600 bg-red-600 text-white',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {isComplete ? '✓' : isInvalid ? '!' : index + 1}
                </div>
                <p className="mt-2.5 max-w-[130px] truncate text-center text-xs font-medium text-gray-600">{step.title}</p>
              </div>
              {index < steps.length - 1 ? (
                <div className="mt-5 h-0.5 flex-1 bg-gray-200/80">
                  <div className={`h-full ${index < state.currentStepIndex ? 'bg-brand' : 'bg-transparent'}`} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
