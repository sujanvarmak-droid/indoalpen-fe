import { useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodTypeAny } from 'zod';
import { StepComponentProps, FieldConfig, FlowData } from '../types/config';
import { useFlowContext } from '../context/FlowContext';
import { useFlowNavigation } from '../hooks/useFlowNavigation';
import { buildDefaults } from '../utils/buildDefaults';
import { evaluateCondition } from '../utils/evaluateCondition';
import { FieldRenderer } from '../components/FieldRenderer';
import { StepNavigation } from '../components/StepNavigation';

function buildSchema(
  fields: FieldConfig[],
  flowData: FlowData,
  currentValues: Record<string, unknown>
): z.ZodObject<Record<string, ZodTypeAny>> {
  const shape: Record<string, ZodTypeAny> = {};
  for (const field of fields) {
    if (field.visibleIf && !evaluateCondition(field.visibleIf, flowData, currentValues)) {
      continue;
    }
    if (field.validation) {
      shape[field.id] = field.validation;
    } else if (field.required) {
      shape[field.id] = z.string().min(1, `${field.label} is required`);
    } else {
      shape[field.id] = z.any().optional();
    }
  }
  return z.object(shape);
}

export function FormStep({ step, config, resolvedSteps }: StepComponentProps) {
  const { state } = useFlowContext();
  const nav = useFlowNavigation(resolvedSteps, config);
  const fields = step.fields ?? [];
  const savedData = state.flowData[step.id];
  const defaultValues = useMemo(() => buildDefaults(fields, savedData), [fields, savedData]);

  const methods = useForm({
    defaultValues,
    mode: 'onTouched',
    resolver: (values, context, options) => {
      const schema = buildSchema(fields, state.flowData, values);
      return zodResolver(schema)(values, context, options);
    },
  });

  useEffect(() => {
    nav.registerForm(methods);
  }, [methods, nav]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void nav.next();
        }}
        noValidate
      >
        <div className="mb-8 border-b border-gray-100 pb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{step.title}</h2>
          {step.description ? <p className="mt-2 text-sm leading-6 text-gray-500">{step.description}</p> : null}
        </div>
        <div className="space-y-6">
          {fields.map((field) => (
            <FieldRenderer key={field.id} field={field} />
          ))}
        </div>
        <StepNavigation
          onBack={nav.back}
          canGoBack={nav.canGoBack}
          onNext={() => void nav.next()}
          labels={config.labels}
        />
      </form>
    </FormProvider>
  );
}
