import { useMemo } from 'react';
import { FlowData, StepConfig } from '../types/config';
import { evaluateCondition } from '../utils/evaluateCondition';

export function useResolvedSteps(steps: StepConfig[], flowData: FlowData): StepConfig[] {
  return useMemo(
    () => steps.filter((step) => !step.skipIf || !evaluateCondition(step.skipIf, flowData)),
    [steps, flowData]
  );
}
