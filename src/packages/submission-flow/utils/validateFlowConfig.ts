import { FlowConfig } from '../types/config';

export const validateFlowConfig = (config: FlowConfig): void => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  if (!config?.id) {
    throw new Error('[SubmissionFlow] config.id is required');
  }
  if (!config?.title) {
    throw new Error('[SubmissionFlow] config.title is required');
  }
  if (!config?.steps?.length) {
    throw new Error('[SubmissionFlow] config.steps must not be empty');
  }

  const stepIds = new Set<string>();
  for (const step of config.steps) {
    if (!step.id) {
      throw new Error('[SubmissionFlow] Step missing id');
    }
    if (!step.title) {
      throw new Error(`[SubmissionFlow] Step "${step.id}" missing title`);
    }
    if (!step.type) {
      throw new Error(`[SubmissionFlow] Step "${step.id}" missing type`);
    }
    if (stepIds.has(step.id)) {
      throw new Error(`[SubmissionFlow] Duplicate step id: "${step.id}"`);
    }
    stepIds.add(step.id);

    if (step.type === 'form' && !step.fields?.length) {
      console.warn(`[SubmissionFlow] Step "${step.id}" is type:form but has no fields`);
    }
    if (step.type === 'upload' && !step.uploadFields?.length) {
      console.warn(`[SubmissionFlow] Step "${step.id}" is type:upload but has no uploadFields`);
    }
    if (step.type === 'custom' && !step.component) {
      throw new Error(`[SubmissionFlow] Step "${step.id}" is type:custom but has no component`);
    }
  }
};
