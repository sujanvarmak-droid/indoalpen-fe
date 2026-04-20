import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Select = forwardRef(
  ({ label, error, id, options = [], placeholder, className, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-md border px-3 py-2 text-sm shadow-sm bg-white',
            'focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors',
            error
              ? 'border-danger focus:ring-danger/40'
              : 'border-gray-300 focus:border-brand-light',
            className
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
