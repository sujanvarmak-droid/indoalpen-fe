import { StepComponentProps } from '../types/config';
import { FileUploadField } from '../components/FileUploadField';
import { StepNavigation } from '../components/StepNavigation';
import { useFlowNavigation } from '../hooks/useFlowNavigation';

export function UploadStep({ step, config, resolvedSteps }: StepComponentProps) {
  const nav = useFlowNavigation(resolvedSteps, config);

  return (
    <div>
      <div className="mb-8 border-b border-gray-100 pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{step.title}</h2>
        {step.description ? <p className="mt-2 text-sm leading-6 text-gray-500">{step.description}</p> : null}
      </div>

      <div className="space-y-7">
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
