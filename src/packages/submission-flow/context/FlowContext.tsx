import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { FlowConfig } from '../types/config';
import { FlowEngineState, FlowAction, FlowRuntime, StepStatus, UploadFieldState } from '../types/engine';

const defaultUpload: UploadFieldState = {
  status: 'idle',
  progress: 0,
  objectUrl: null,
  fileName: null,
  error: null,
};

const hasValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some((item) => hasValue(item));
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).some((item) => hasValue(item));
  return true;
};

const isStepPrefilled = (
  step: FlowConfig['steps'][number],
  flowData: FlowEngineState['flowData']
): boolean => {
  const stepData = flowData[step.id];
  if (!stepData || typeof stepData !== 'object') {
    return false;
  }

  if (step.type === 'upload') {
    const requiredUploads = (step.uploadFields ?? []).filter((field) => field.required);
    if (requiredUploads.length === 0) {
      return hasValue(stepData);
    }
    return requiredUploads.every((field) => hasValue((stepData as Record<string, unknown>)[field.id]));
  }

  if (step.type === 'form') {
    const requiredFields = (step.fields ?? []).filter((field) => field.required);
    if (requiredFields.length === 0) {
      return hasValue(stepData);
    }
    return requiredFields.every((field) => hasValue((stepData as Record<string, unknown>)[field.id]));
  }

  return false;
};

const getUploadUrl = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === 'string' && item.trim());
    return typeof first === 'string' ? first : null;
  }
  return null;
};

const getFileNameFromUrl = (url: string | null): string | null => {
  if (!url) return null;
  const cleanUrl = url.split('?')[0];
  const parts = cleanUrl.split('/');
  const lastPart = parts[parts.length - 1];
  return lastPart || 'Uploaded file';
};

const buildInitialUploadState = (
  config: FlowConfig,
  flowData: FlowEngineState['flowData']
): FlowEngineState['uploadState'] => {
  const uploadState: FlowEngineState['uploadState'] = {};

  for (const step of config.steps) {
    if (step.type !== 'upload') continue;
    const stepData = flowData[step.id];
    if (!stepData || typeof stepData !== 'object') continue;

    for (const field of step.uploadFields ?? []) {
      const objectUrl = getUploadUrl((stepData as Record<string, unknown>)[field.id]);
      if (!objectUrl) continue;
      uploadState[field.id] = {
        status: 'done',
        progress: 100,
        objectUrl,
        fileName: getFileNameFromUrl(objectUrl),
        error: null,
      };
    }
  }

  return uploadState;
};

function flowReducer(state: FlowEngineState, action: FlowAction): FlowEngineState {
  switch (action.type) {
    case 'SAVE_STEP_DATA':
      return {
        ...state,
        flowData: {
          ...state.flowData,
          [action.stepId]: action.data,
        },
      };
    case 'GO_NEXT':
      return {
        ...state,
        currentStepIndex: action.nextIndex,
        stepHistory: [...state.stepHistory, state.currentStepIndex],
      };
    case 'GO_BACK': {
      const history = [...state.stepHistory];
      const previous = history.pop() ?? 0;
      return {
        ...state,
        currentStepIndex: previous,
        stepHistory: history,
      };
    }
    case 'SET_STEP_STATUS':
      return {
        ...state,
        stepStatus: {
          ...state.stepStatus,
          [action.stepId]: action.status,
        },
      };
    case 'SET_UPLOAD':
      return {
        ...state,
        uploadState: {
          ...state.uploadState,
          [action.fieldId]: {
            ...(state.uploadState[action.fieldId] ?? defaultUpload),
            ...action.patch,
          },
        },
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.value,
      };
    case 'SET_SUBMIT_ERROR':
      return {
        ...state,
        submitError: action.error,
      };
    default:
      return state;
  }
}

interface FlowContextValue {
  state: FlowEngineState;
  dispatch: (action: FlowAction) => void;
  runtime: FlowRuntime;
}

const FlowContext = createContext(null);

interface FlowProviderProps {
  config: FlowConfig;
  runtime: FlowRuntime;
  initialFlowData?: FlowEngineState['flowData'];
  children?: unknown;
}

export function FlowProvider({ config, runtime, initialFlowData, children }: FlowProviderProps) {
  const flowData = initialFlowData ?? {};
  const completedStepIds = Array.isArray((flowData as Record<string, unknown>).__completedStepIds)
    ? ((flowData as Record<string, unknown>).__completedStepIds as string[])
    : [];
  const initialStepStatus = Object.fromEntries(
    config.steps.map((step) => [
      step.id,
      ((completedStepIds.includes(step.id) || isStepPrefilled(step, flowData)) ? 'complete' : 'idle') as StepStatus,
    ])
  );
  const firstIncompleteIndex = config.steps.findIndex((step) => initialStepStatus[step.id] !== 'complete');
  const currentStepIndex = firstIncompleteIndex === -1 ? config.steps.length - 1 : firstIncompleteIndex;

  const initialState: FlowEngineState = {
    flowData,
    currentStepIndex,
    stepHistory: Array.from({ length: currentStepIndex }, (_, index) => index),
    stepStatus: initialStepStatus,
    uploadState: buildInitialUploadState(config, flowData),
    isSubmitting: false,
    submitError: null,
  };

  const [state, dispatch] = useReducer(flowReducer, initialState);
  const value = useMemo(() => ({ state, dispatch, runtime }), [state, runtime]);

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlowContext(): FlowContextValue {
  const ctx = useContext(FlowContext) as FlowContextValue | null;
  if (!ctx) {
    throw new Error('useFlowContext must be used inside <FlowProvider>');
  }
  return ctx;
}
