import { Controller, FieldErrors, useFormContext } from 'react-hook-form';
import { FieldConfig } from '../../types/config';
import { errorText, hintText, labelBase } from './_utils';

interface FieldProps {
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

export function RadioField({ field, namePrefix }: FieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const name = namePrefix ? `${namePrefix}.${field.id}` : field.id;
  const error = getError(errors, name);

  return (
    <fieldset>
      <legend className={labelBase}>{field.label}</legend>
      <Controller
        control={control}
        name={name}
        render={({ field: controllerField }) => (
          <div className="space-y-2 rounded-md border border-gray-200 bg-white p-3">
            {(field.options ?? []).map((option) => (
              <label key={option.value} className="inline-flex w-full items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={controllerField.value === option.value}
                  onChange={() => controllerField.onChange(option.value)}
                  className="h-4 w-4 border-gray-300 text-brand focus:ring-brand"
                />
                {option.label}
              </label>
            ))}
          </div>
        )}
      />
      {error?.message ? <p className={errorText}>{String(error.message)}</p> : null}
      {field.hint ? <p className={hintText}>{field.hint}</p> : null}
    </fieldset>
  );
}
