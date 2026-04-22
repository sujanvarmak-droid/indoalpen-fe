import { FieldConfig, StepConfig, StepData } from '../types/config';

interface ReviewSectionProps {
  step: StepConfig;
  data: StepData;
}

const formatValue = (value: unknown, field: FieldConfig): string => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (field.type === 'tags' || field.type === 'multiselect') {
    return Array.isArray(value) ? value.join(', ') : '—';
  }
  return String(value);
};

export function ReviewSection({ step, data }: ReviewSectionProps) {
  return (
    <section className="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-brand">{step.title}</h3>

      {step.type === 'form' ? (
        <div className="mt-4 space-y-4">
          {(step.fields ?? []).map((field) => {
            if (field.type === 'repeatable') {
              const items = Array.isArray(data[field.id]) ? (data[field.id] as Record<string, unknown>[]) : [];
              return (
                <div key={field.id}>
                  <h4 className="text-sm font-medium text-gray-700">{field.label}</h4>
                  <div className="mt-2 space-y-2">
                    {items.length === 0 ? (
                      <p className="text-sm text-gray-500">—</p>
                    ) : (
                      items.map((item, index) => (
                        <div
                          key={`${field.id}-${index}`}
                          className="rounded-lg border border-gray-200 bg-brand-muted/20 p-3"
                        >
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            #{index + 1}
                          </p>
                          <dl className="space-y-1">
                            {(field.repeatable?.fields ?? []).map((subField) => (
                              <div key={subField.id} className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-3 sm:gap-3">
                                <dt className="font-medium text-gray-700">{subField.label}</dt>
                                <dd className="text-gray-600 sm:col-span-2">{formatValue(item[subField.id], subField)}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div key={field.id} className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-3 sm:gap-3">
                <dt className="font-medium text-gray-700">{field.label}</dt>
                <dd className="text-gray-600 sm:col-span-2">{formatValue(data[field.id], field)}</dd>
              </div>
            );
          })}
        </div>
      ) : null}

      {step.type === 'upload' ? (
        <dl className="mt-4 space-y-2">
          {(step.uploadFields ?? []).map((uploadField) => (
            <div key={uploadField.id} className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-3 sm:gap-3">
              <dt className="font-medium text-gray-700">{uploadField.label}</dt>
              <dd className="text-gray-600 sm:col-span-2">{data[uploadField.id] ? '✓ Uploaded' : '—'}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
