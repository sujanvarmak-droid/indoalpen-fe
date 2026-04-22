import { Controller, FieldErrors, useFormContext } from 'react-hook-form';
import { FieldConfig } from '../../types/config';
import { cx, errorText, hintText, inputBase, inputError, inputNormal, labelBase } from './_utils';

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

export function SelectField({ field, namePrefix }: FieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const name = namePrefix ? `${namePrefix}.${field.id}` : field.id;
  const error = getError(errors, name);

  return (
    <div>
      <label htmlFor={name} className={labelBase}>
        {field.label}
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field: controllerField }) => (
          <select
            id={name}
            {...controllerField}
            className={cx(inputBase, error ? inputError : inputNormal)}
            value={(controllerField.value as string | undefined) ?? ''}
          >
            <option value="" disabled>
              {field.placeholder ?? `Select ${field.label}`}
            </option>
            {(field.options ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />
      {error?.message ? <p className={errorText}>{String(error.message)}</p> : null}
      {field.hint ? <p className={hintText}>{field.hint}</p> : null}
    </div>
  );
}
