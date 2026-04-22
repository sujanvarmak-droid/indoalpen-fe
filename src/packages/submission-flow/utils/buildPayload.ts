import { FlowData, PayloadMap } from '../types/config';

export const buildPayload = (flowData: FlowData, payloadMap?: PayloadMap): Record<string, unknown> => {
  if (!payloadMap) {
    return Object.values(flowData).reduce<Record<string, unknown>>(
      (acc, stepData) => ({ ...acc, ...stepData }),
      {}
    );
  }

  const payload: Record<string, unknown> = {};
  for (const [source, target] of Object.entries(payloadMap)) {
    if (source.includes('.')) {
      const [stepId, fieldId] = source.split('.');
      const value = flowData[stepId]?.[fieldId];
      if (value !== undefined) {
        payload[target] = value;
      }
      continue;
    }

    for (const stepData of Object.values(flowData)) {
      if (stepData && source in stepData) {
        payload[target] = stepData[source];
        break;
      }
    }
  }

  return payload;
};
