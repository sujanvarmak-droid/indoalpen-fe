import { Condition, FlowData } from '../types/config';

const resolveValue = (
  field: string,
  flowData: FlowData,
  currentValues?: Record<string, unknown>
): unknown => {
  if (field.includes('.')) {
    const [stepId, fieldId] = field.split('.');
    return flowData[stepId]?.[fieldId];
  }

  if (currentValues && field in currentValues) {
    return currentValues[field];
  }

  for (const stepData of Object.values(flowData)) {
    if (stepData && field in stepData) {
      return stepData[field];
    }
  }

  return undefined;
};

export const evaluateCondition = (
  condition: Condition,
  flowData: FlowData,
  currentValues?: Record<string, unknown>
): boolean => {
  const value = resolveValue(condition.field, flowData, currentValues);

  switch (condition.operator) {
    case 'eq':
      return value === condition.value;
    case 'neq':
      return value !== condition.value;
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(value);
    case 'notIn':
      return Array.isArray(condition.value) && !condition.value.includes(value);
    case 'truthy':
      return Boolean(value);
    case 'falsy':
      return !Boolean(value);
    default:
      return true;
  }
};
