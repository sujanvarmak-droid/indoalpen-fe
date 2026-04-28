import { useRef, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FlowConfig, StepConfig } from '../types/config';
import { useFlowContext } from '../context/FlowContext';
import { evaluateCondition } from '../utils/evaluateCondition';

const getFirstValidationMessage = (errors: unknown): string | null => {
  if (!errors || typeof errors !== 'object') return null;

  if ('message' in errors && typeof (errors as { message?: unknown }).message === 'string') {
    return (errors as { message: string }).message;
  }

  if (Array.isArray(errors)) {
    for (const item of errors) {
      const nested = getFirstValidationMessage(item);
      if (nested) return nested;
    }
    return null;
  }

  for (const value of Object.values(errors as Record<string, unknown>)) {
    const nested = getFirstValidationMessage(value);
    if (nested) return nested;
  }

  return null;
};

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
    dispatch({ type: 'SET_SUBMIT_ERROR', error: null });

    if (currentStep.type === 'form') {
      if (!formRef.current) {
        dispatch({ type: 'SET_SUBMIT_ERROR', error: 'Form is not ready. Please try again.' });
        return;
      }
      const isValid = await formRef.current.trigger();
      if (!isValid) {
        const validationMessage =
          getFirstValidationMessage(formRef.current.formState.errors) ??
          'Please complete all required fields to continue.';
        dispatch({ type: 'SET_SUBMIT_ERROR', error: validationMessage });
        dispatch({ type: 'SET_STEP_STATUS', stepId: currentStep.id, status: 'invalid' });
        return;
      }
      const values = formRef.current.getValues();
      dispatch({ type: 'SAVE_STEP_DATA', stepId: currentStep.id, data: values });
      if (runtime.saveStep) {
        try {
          await runtime.saveStep(currentStep.id, values);
        } catch (error) {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String(error.message)
              : 'Failed to save this step. Please try again.';
          dispatch({ type: 'SET_SUBMIT_ERROR', error: message });
          dispatch({ type: 'SET_STEP_STATUS', stepId: currentStep.id, status: 'invalid' });
          return;
        }
      }
      dispatch({ type: 'SET_STEP_STATUS', stepId: currentStep.id, status: 'complete' });
    }

    if (currentStep.type === 'upload') {
      const missing = (currentStep.uploadFields ?? []).filter(
        (field) => field.required && !state.uploadState[field.id]?.objectUrl
      );
      if (missing.length > 0) {
        dispatch({ type: 'SET_SUBMIT_ERROR', error: 'Please upload all required files to continue.' });
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
      });

      dispatch({ type: 'SAVE_STEP_DATA', stepId: currentStep.id, data: uploadData });
      if (runtime.saveStep) {
        try {
          await runtime.saveStep(currentStep.id, uploadData);
        } catch (error) {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String(error.message)
              : 'Failed to save this step. Please try again.';
          dispatch({ type: 'SET_SUBMIT_ERROR', error: message });
          dispatch({ type: 'SET_STEP_STATUS', stepId: currentStep.id, status: 'invalid' });
          return;
        }
      }
      dispatch({ type: 'SET_STEP_STATUS', stepId: currentStep.id, status: 'complete' });
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
