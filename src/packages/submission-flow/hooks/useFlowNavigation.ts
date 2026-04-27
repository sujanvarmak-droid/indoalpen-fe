import { useRef, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FlowConfig, StepConfig } from '../types/config';
import { useFlowContext } from '../context/FlowContext';
import { evaluateCondition } from '../utils/evaluateCondition';

export function useFlowNavigation(resolvedSteps: StepConfig[], _config: FlowConfig) {
  const { state, dispatch, runtime } = useFlowContext();
  const formRef = useRef<UseFormReturn | null>(null);

  const registerForm = useCallback((methods: UseFormReturn) => {
    formRef.current = methods;
  }, []);

  const next = useCallback(async () => {
    const currentStep = resolvedSteps[state.currentStepIndex];
    if (!currentStep) {
      return;
    }

    if (currentStep.type === 'form') {
      if (!formRef.current) {
        return;
      }
      const isValid = await formRef.current.trigger();
      if (!isValid) {
        dispatch({ type: 'SET_STEP_STATUS', stepId: currentStep.id, status: 'invalid' });
        return;
      }
      const values = formRef.current.getValues();
      dispatch({ type: 'SAVE_STEP_DATA', stepId: currentStep.id, data: values });
      dispatch({ type: 'SET_STEP_STATUS', stepId: currentStep.id, status: 'complete' });

      try {
        await runtime.onStepComplete?.({
          stepId: currentStep.id,
          data: values as Record<string, unknown>,
          flowData: {
            ...state.flowData,
            [currentStep.id]: values as Record<string, unknown>,
          },
        });
      } catch {
        dispatch({ type: 'SET_STEP_STATUS', stepId: currentStep.id, status: 'invalid' });
        return;
      }
    }

    if (currentStep.type === 'upload') {
      const missing = (currentStep.uploadFields ?? []).filter(
        (field) => field.required && !state.uploadState[field.id]?.objectUrl
      );
      if (missing.length > 0) {
        missing.forEach((field) =>
          dispatch({
            type: 'SET_UPLOAD',
            fieldId: field.id,
            patch: { error: `${field.label} is required` },
          })
        );
        dispatch({ type: 'SET_STEP_STATUS', stepId: currentStep.id, status: 'invalid' });
        return;
      }

      const uploadData: Record<string, unknown> = {};
      (currentStep.uploadFields ?? []).forEach((field) => {
        const uploadState = state.uploadState[field.id];
        if (uploadState?.objectUrl) {
          uploadData[field.id] = uploadState.objectUrl;
        }
        if (uploadState?.fileId) {
          uploadData[`${field.id}FileId`] = uploadState.fileId;
        }
      });

      dispatch({ type: 'SAVE_STEP_DATA', stepId: currentStep.id, data: uploadData });
      dispatch({ type: 'SET_STEP_STATUS', stepId: currentStep.id, status: 'complete' });

      try {
        await runtime.onStepComplete?.({
          stepId: currentStep.id,
          data: uploadData,
          flowData: {
            ...state.flowData,
            [currentStep.id]: uploadData,
          },
        });
      } catch {
        dispatch({ type: 'SET_STEP_STATUS', stepId: currentStep.id, status: 'invalid' });
        return;
      }
    }

    let nextIndex = state.currentStepIndex + 1;
    while (nextIndex < resolvedSteps.length) {
      const candidate = resolvedSteps[nextIndex];
      if (!candidate.skipIf) {
        break;
      }
      if (!evaluateCondition(candidate.skipIf, state.flowData)) {
        break;
      }
      nextIndex += 1;
    }

    if (nextIndex < resolvedSteps.length) {
      dispatch({ type: 'GO_NEXT', nextIndex });
    }
  }, [dispatch, resolvedSteps, runtime, state]);

  const back = useCallback(() => {
    if (state.stepHistory.length > 0) {
      dispatch({ type: 'GO_BACK' });
    }
  }, [dispatch, state.stepHistory.length]);

  return {
    next,
    back,
    registerForm,
    canGoBack: state.stepHistory.length > 0,
    isLastStep: state.currentStepIndex === resolvedSteps.length - 1,
  };
}
