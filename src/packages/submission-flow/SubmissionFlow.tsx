import { useEffect } from 'react';
import { SubmissionFlowProps } from './types/config';
import { FlowProvider } from './context/FlowContext';
import { StepRenderer } from './components/StepRenderer';
import { Stepper } from './components/Stepper';
import { validateFlowConfig } from './utils/validateFlowConfig';

function RedirectMode({
  redirectUrl,
  onCancel,
}: Pick<SubmissionFlowProps, 'redirectUrl' | 'onCancel'>) {
  useEffect(() => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }, [redirectUrl]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      <p className="text-sm text-gray-600">Redirecting to external submission portal...</p>
      {onCancel ? (
        <button onClick={onCancel} className="mt-2 text-xs text-gray-400 underline hover:text-gray-600">
          Cancel
        </button>
      ) : null}
    </div>
  );
}

function IframeMode({
  iframeUrl,
  onSuccess,
  onCancel,
}: Pick<SubmissionFlowProps, 'iframeUrl' | 'onSuccess' | 'onCancel'>) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'FLOW_SUCCESS') {
        onSuccess?.(event.data.result);
      }
      if (event.data?.type === 'FLOW_CANCEL') {
        onCancel?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onCancel]);

  return (
    <div className="w-full">
      {onCancel ? (
        <div className="mb-2 flex justify-end">
          <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600">
            ✕ Cancel
          </button>
        </div>
      ) : null}
      <iframe
        src={iframeUrl}
        className="h-screen w-full rounded-lg border border-gray-200"
        title="Submission Portal"
        allow="camera; microphone"
      />
    </div>
  );
}

function InlineMode({
  config,
  submitFn,
  saveStep,
  loadReview,
  uploadFile,
  onSuccess,
  onCancel,
  labels,
  className,
}: SubmissionFlowProps) {
  useEffect(() => {
    if (config) {
      validateFlowConfig(config);
    }
  }, [config]);

  if (!config) {
    throw new Error('[SubmissionFlow] mode="inline" requires config prop');
  }
  if (!submitFn) {
    throw new Error('[SubmissionFlow] mode="inline" requires submitFn prop');
  }
  if (!uploadFile) {
    throw new Error('[SubmissionFlow] mode="inline" requires uploadFile prop');
  }

  const configWithCallbacks = { ...config, onSuccess, labels: labels ?? config.labels };
  const runtime = { uploadFile, submitFn, saveStep, loadReview };

  return (
    <FlowProvider config={configWithCallbacks} runtime={runtime}>
      <div className={`w-full bg-gradient-to-b from-brand-muted/40 to-white ${className ?? ''}`}>
        <div className="mx-auto w-full max-w-6xl px-4 pt-3 sm:px-6 sm:pt-5 lg:px-8">
          <Stepper steps={configWithCallbacks.steps} />
        </div>
        <div className="mx-auto mt-5 w-full max-w-3xl px-4 pb-10 sm:mt-7 sm:px-6 sm:pb-14">
          <div className="rounded-3xl border border-gray-200/90 bg-white/95 p-5 shadow-lg shadow-gray-200/50 backdrop-blur-sm sm:p-7">
            {onCancel ? (
              <div className="mb-4 flex justify-end sm:mb-5">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:text-sm"
                >
                  ✕ {labels?.cancelButton ?? 'Cancel'}
                </button>
              </div>
            ) : null}
            <StepRenderer config={configWithCallbacks} />
          </div>
        </div>
      </div>
    </FlowProvider>
  );
}

export function SubmissionFlow(props: SubmissionFlowProps) {
  switch (props.mode) {
    case 'redirect':
      return <RedirectMode redirectUrl={props.redirectUrl} onCancel={props.onCancel} />;
    case 'iframe':
      return <IframeMode iframeUrl={props.iframeUrl} onSuccess={props.onSuccess} onCancel={props.onCancel} />;
    case 'inline':
    default:
      return <InlineMode {...props} />;
  }
}
