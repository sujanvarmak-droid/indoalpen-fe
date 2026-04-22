import { KeyboardEvent, useState } from 'react';
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

export function TagsField({ field, namePrefix }: FieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const name = namePrefix ? `${namePrefix}.${field.id}` : field.id;
  const error = getError(errors, name);
  const maxTags = field.maxTags ?? 10;

  return (
    <div>
      <label className={labelBase}>{field.label}</label>
      <Controller
        control={control}
        name={name}
        defaultValue={[]}
        render={({ field: controllerField }) => {
          const tags = Array.isArray(controllerField.value) ? (controllerField.value as string[]) : [];

          const addTag = () => {
            const nextTag = inputValue.trim();
            if (!nextTag || tags.includes(nextTag) || tags.length >= maxTags) {
              return;
            }
            controllerField.onChange([...tags, nextTag]);
            setInputValue('');
          };

          const removeTag = (tagToRemove: string) => {
            controllerField.onChange(tags.filter((tag) => tag !== tagToRemove));
          };

          const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTag();
            } else if (event.key === 'Backspace' && inputValue.length === 0 && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          };

          return (
            <div>
              <div
                className={cx(
                  inputBase,
                  'flex min-h-[44px] flex-wrap items-center gap-2 p-2',
                  isFocused ? 'ring-2 ring-blue-500 border-transparent' : '',
                  error ? inputError : inputNormal
                )}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag}`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={tags.length === 0 ? field.placeholder : 'Add another...'}
                  className="min-w-[120px] flex-1 border-none bg-transparent text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">{tags.length}/{maxTags} tags</p>
            </div>
          );
        }}
      />
      {error?.message ? <p className={errorText}>{String(error.message)}</p> : null}
      {field.hint ? <p className={hintText}>{field.hint}</p> : null}
    </div>
  );
}
