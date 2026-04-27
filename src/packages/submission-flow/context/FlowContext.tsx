import { createContext, useContext, useReducer, useMemo, ReactNode, Dispatch } from 'react';
import { FlowConfig } from '../types/config';
import { FlowEngineState, FlowAction, FlowRuntime, StepStatus, UploadFieldState } from '../types/engine';

const defaultUpload: UploadFieldState = {
  status: 'idle',
  progress: 0,
  objectUrl: null,
  fileName: null,
  fileId: null,
  error: null,
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
  dispatch: Dispatch<FlowAction>;
  runtime: FlowRuntime;
}

const FlowContext = createContext<FlowContextValue | null>(null);

interface FlowProviderProps {
  config: FlowConfig;
  runtime: FlowRuntime;
  children: ReactNode;
}

export function FlowProvider({ config, runtime, children }: FlowProviderProps) {
  const initialState: FlowEngineState = {
    flowData: {},
    currentStepIndex: 0,
    stepHistory: [],
    stepStatus: Object.fromEntries(config.steps.map((step) => [step.id, 'idle' as StepStatus])),
    uploadState: {},
    isSubmitting: false,
    submitError: null,
  };

  const [state, dispatch] = useReducer(flowReducer, initialState);
  const value = useMemo(() => ({ state, dispatch, runtime }), [state, runtime]);

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlowContext(): FlowContextValue {
  const ctx = useContext(FlowContext);
  if (!ctx) {
    throw new Error('useFlowContext must be used inside <FlowProvider>');
  }
  return ctx;
}
