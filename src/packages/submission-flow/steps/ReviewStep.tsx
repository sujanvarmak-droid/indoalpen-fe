import { StepComponentProps } from '../types/config';
import { useFlowContext } from '../context/FlowContext';
import { useFlowNavigation } from '../hooks/useFlowNavigation';
import { buildPayload } from '../utils/buildPayload';
import { ReviewSection } from '../components/ReviewSection';
import { StepNavigation } from '../components/StepNavigation';

export function ReviewStep({ step, config, resolvedSteps }: StepComponentProps) {
  const { state, dispatch, runtime } = useFlowContext();
  const nav = useFlowNavigation(resolvedSteps, config);
  const handleExportPDF = () => {
    window.print();
  };

  const handleSubmit = async () => {
    dispatch({ type: 'SET_SUBMITTING', value: true });
    dispatch({ type: 'SET_SUBMIT_ERROR', error: null });
    try {
      const payload = buildPayload(state.flowData, config.submit.payloadMap);
      const result = await runtime.submitFn(payload);
      config.onSuccess?.(result);
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Submission failed.';
      dispatch({ type: 'SET_SUBMIT_ERROR', error: message });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', value: false });
    }
  };

  const summarySteps = resolvedSteps.filter((resolvedStep) => resolvedStep.type !== 'review');

  return (
    <div>
      <div className="mb-8 border-b border-gray-100 pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{step.title}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Review your submission before sending. Use Back to make changes.
        </p>
      </div>

      <div className="space-y-5">
        {summarySteps.map((summaryStep) => (
          <ReviewSection key={summaryStep.id} step={summaryStep} data={state.flowData[summaryStep.id] ?? {}} />
        ))}
      </div>

      {state.submitError ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.submitError}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end" data-print-hidden>
        <button
          type="button"
          onClick={handleExportPDF}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export as PDF
        </button>
      </div>

      <StepNavigation
        onBack={nav.back}
        canGoBack={nav.canGoBack}
        showSubmit
        onSubmit={() => void handleSubmit()}
        isLoading={state.isSubmitting}
        labels={config.labels}
      />
    </div>
  );
}
