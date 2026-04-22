import { FieldErrors, useFormContext } from 'react-hook-form';
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

export function DateField({ field, namePrefix }: FieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const name = namePrefix ? `${namePrefix}.${field.id}` : field.id;
  const error = getError(errors, name);

  return (
    <div>
      <label htmlFor={name} className={labelBase}>
        {field.label}
      </label>
      <input
        id={name}
        type="date"
        min={field.dateMin}
        max={field.dateMax}
        className={cx(inputBase, error ? inputError : inputNormal)}
        {...register(name)}
      />
      {error?.message ? <p className={errorText}>{String(error.message)}</p> : null}
      {field.hint ? <p className={hintText}>{field.hint}</p> : null}
    </div>
  );
}
