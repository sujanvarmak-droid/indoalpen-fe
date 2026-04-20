import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Input = forwardRef(
  ({ label, error, id, type = 'text', className, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={cn(
            'w-full rounded-md border px-3 py-2 text-sm shadow-sm',
            'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light',
            'transition-colors',
            error
              ? 'border-danger focus:ring-danger/40'
              : 'border-gray-300 focus:border-brand-light',
            className
          )}
          {...rest}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
