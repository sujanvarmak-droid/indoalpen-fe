import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Textarea = forwardRef(
  ({ label, error, id, rows = 4, className, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          className={cn(
            'w-full rounded-md border px-3 py-2 text-sm shadow-sm resize-vertical',
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

Textarea.displayName = 'Textarea';
