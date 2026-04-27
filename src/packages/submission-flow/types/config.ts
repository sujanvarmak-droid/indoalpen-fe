import { ComponentType } from 'react';
import { ZodTypeAny } from 'zod';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'date'
  | 'tags'
  | 'repeatable'
  | 'link';

export type StepType = 'form' | 'upload' | 'review' | 'custom';

export type ConditionOperator = 'eq' | 'neq' | 'in' | 'notIn' | 'truthy' | 'falsy';

export interface Condition {
  field: string;
  operator: ConditionOperator;
  value?: unknown;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface RepeatableConfig {
  minItems: number;
  maxItems: number;
  addLabel: string;
  fields: FieldConfig[];
}

export interface FieldConfig {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: ZodTypeAny;
  options?: FieldOption[];
  visibleIf?: Condition;
  repeatable?: RepeatableConfig;
  defaultValue?: unknown;
  hint?: string;
  linkHref?: string;
  dateMin?: string;
  dateMax?: string;
  maxTags?: number;
}

export interface UploadFieldConfig {
  id: string;
  label: string;
  mimeTypes: string[];
  maxMb: number;
  maxFiles: number;
  required: boolean;
  hint?: string;
}

export interface UploadResult {
  objectUrl: string;
  fileName: string;
  fileId?: string;
}

export type UploadFileFn = (
  file: File,
  fieldId: string,
  onProgress: (percent: number) => void
) => Promise<UploadResult>;

export interface CustomStepProps {
  step: StepConfig;
  config: FlowConfig;
  resolvedSteps: StepConfig[];
  flowData: FlowData;
  onNext: () => void;
  onBack: () => void;
}

export interface StepConfig {
  id: string;
  title: string;
  type: StepType;
  description?: string;
  fields?: FieldConfig[];
  uploadFields?: UploadFieldConfig[];
  component?: ComponentType<CustomStepProps>;
  skipIf?: Condition;
}

export interface PayloadMap {
  [sourceKey: string]: string;
}

export type SubmitFlowFn = (payload: Record<string, unknown>) => Promise<unknown>;
export type FetchReviewDataFn = () => Promise<unknown>;
export type StepCompleteFn = (params: {
  stepId: string;
  data: Record<string, unknown>;
  flowData: FlowData;
}) => Promise<void> | void;

export interface SubmitConfig {
  payloadMap?: PayloadMap;
}

export interface FlowConfig {
  id: string;
  title: string;
  steps: StepConfig[];
  submit: SubmitConfig;
  onSuccess?: (result: unknown) => void;
  labels?: {
    nextButton?: string;
    backButton?: string;
    submitButton?: string;
    cancelButton?: string;
  };
}

export type StepData = Record<string, unknown>;
export type FlowData = Record<string, StepData>;

export type FlowMode = 'inline' | 'redirect' | 'iframe';

export interface SubmissionFlowProps {
  mode: FlowMode;
  config?: FlowConfig;
  submitFn?: SubmitFlowFn;
  fetchReviewData?: FetchReviewDataFn;
  onStepComplete?: StepCompleteFn;
  uploadFile?: UploadFileFn;
  redirectUrl?: string;
  iframeUrl?: string;
  onSuccess?: (result: unknown) => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  labels?: {
    nextButton?: string;
    backButton?: string;
    submitButton?: string;
    cancelButton?: string;
  };
}

export interface StepComponentProps {
  step: StepConfig;
  config: FlowConfig;
  resolvedSteps: StepConfig[];
}
