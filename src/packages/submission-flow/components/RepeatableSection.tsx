import { useFieldArray, useFormContext, FieldErrors } from 'react-hook-form';
import { FieldConfig } from '../types/config';
import { errorText, hintText, labelBase } from './fields/_utils';
import { FieldRenderer } from './FieldRenderer';

interface RepeatableSectionProps {
  field: FieldConfig;
  namePrefix?: string;
}

const getError = (errors: FieldErrors, name: string): { message?: string } | undefined =>
  name.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, errors) as { message?: string } | undefined;

const buildItemDefault = (field: FieldConfig): Record<string, unknown> => {
  const item: Record<string, unknown> = {};
  for (const subField of field.repeatable?.fields ?? []) {
    if (subField.defaultValue !== undefined) {
      item[subField.id] = subField.defaultValue;
    } else if (subField.type === 'multiselect' || subField.type === 'tags') {
      item[subField.id] = [];
    } else {
      item[subField.id] = '';
    }
  }
  return item;
};

export function RepeatableSection({ field, namePrefix }: RepeatableSectionProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const fieldName = namePrefix ? `${namePrefix}.${field.id}` : field.id;
  const repeatable = field.repeatable;
  const error = getError(errors, fieldName);

  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });

  if (!repeatable) {
    return null;
  }

  return (
    <div>
      <label className={labelBase}>{field.label}</label>
      {fields.map((item, index) => (
        <div key={item.id} className="relative mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="space-y-4">
            {repeatable.fields.map((subField) => (
              <FieldRenderer key={`${item.id}-${subField.id}`} field={subField} namePrefix={`${fieldName}.${index}`} />
            ))}
          </div>
          {fields.length > repeatable.minItems ? (
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute right-3 top-3 text-sm text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          ) : null}
        </div>
      ))}
      {fields.length < repeatable.maxItems ? (
        <button
          type="button"
          onClick={() => append(buildItemDefault(field))}
          className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {repeatable.addLabel}
        </button>
      ) : null}
      {error?.message ? <p className={errorText}>{String(error.message)}</p> : null}
      {field.hint ? <p className={hintText}>{field.hint}</p> : null}
    </div>
  );
}
