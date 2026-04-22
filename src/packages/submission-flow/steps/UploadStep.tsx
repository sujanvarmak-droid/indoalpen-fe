import { StepComponentProps } from '../types/config';
import { FileUploadField } from '../components/FileUploadField';
import { StepNavigation } from '../components/StepNavigation';
import { useFlowNavigation } from '../hooks/useFlowNavigation';

export function UploadStep({ step, config, resolvedSteps }: StepComponentProps) {
  const nav = useFlowNavigation(resolvedSteps, config);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{step.title}</h2>
        {step.description ? <p className="mt-1 text-sm text-gray-500">{step.description}</p> : null}
      </div>

      <div className="space-y-6">
        {(step.uploadFields ?? []).map((uploadField) => (
          <FileUploadField key={uploadField.id} fieldConfig={uploadField} />
        ))}
      </div>

      <StepNavigation
        onBack={nav.back}
        canGoBack={nav.canGoBack}
        onNext={() => void nav.next()}
        labels={config.labels}
      />
    </div>
  );
}
