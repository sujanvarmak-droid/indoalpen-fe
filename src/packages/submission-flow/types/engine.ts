import { FlowData, StepData, UploadFileFn, SubmitFlowFn, SaveStepFn, LoadReviewFn } from './config';

export type StepStatus = 'idle' | 'valid' | 'invalid' | 'complete';

export interface UploadFieldState {
  status: 'idle' | 'uploading' | 'done' | 'error';
  progress: number;
  objectUrl: string | null;
  fileName: string | null;
  error: string | null;
}

export interface FlowEngineState {
  flowData: FlowData;
  currentStepIndex: number;
  stepHistory: number[];
  stepStatus: Record<string, StepStatus>;
  uploadState: Record<string, UploadFieldState>;
  isSubmitting: boolean;
  submitError: string | null;
}

export type FlowAction =
  | { type: 'SAVE_STEP_DATA'; stepId: string; data: StepData }
  | { type: 'GO_NEXT'; nextIndex: number }
  | { type: 'GO_BACK' }
  | { type: 'SET_STEP_STATUS'; stepId: string; status: StepStatus }
  | { type: 'SET_UPLOAD'; fieldId: string; patch: Partial<UploadFieldState> }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SET_SUBMIT_ERROR'; error: string | null };

export interface FlowRuntime {
  uploadFile: UploadFileFn;
  submitFn: SubmitFlowFn;
  saveStep?: SaveStepFn;
  loadReview?: LoadReviewFn;
}
