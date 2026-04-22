import { StepComponentProps } from '../types/config';
import { useFlowNavigation } from '../hooks/useFlowNavigation';
import { useFlowContext } from '../context/FlowContext';

export function CustomStep({ step, config, resolvedSteps }: StepComponentProps) {
  const nav = useFlowNavigation(resolvedSteps, config);

  if (!step.component) {
    return (
      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-5">
        <p className="font-semibold text-red-700">Custom step "{step.id}" has no component defined in config.</p>
      </div>
    );
  }

  const { state } = useFlowContext();
  const Component = step.component;

  return (
    <Component
      step={step}
      config={config}
      resolvedSteps={resolvedSteps}
      flowData={state.flowData}
      onNext={() => void nav.next()}
      onBack={nav.back}
    />
  );
}
