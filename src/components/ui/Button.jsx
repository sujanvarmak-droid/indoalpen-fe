import { cn } from '@/utils/cn';

const variantClasses = {
  primary:
    'bg-brand text-white hover:bg-brand-light focus:ring-brand disabled:bg-brand/50',
  secondary:
    'bg-white text-brand border border-brand hover:bg-brand-muted focus:ring-brand disabled:opacity-50',
  danger:
    'bg-danger text-white hover:bg-red-800 focus:ring-red-400 disabled:bg-danger/50',
  ghost:
    'bg-transparent text-brand hover:bg-brand-muted focus:ring-brand disabled:opacity-50',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = ({
  variant = 'primary',
  loading = false,
  disabled = false,
  size = 'md',
  fullWidth = false,
  type = 'button',
  onClick,
  className,
  children,
  ...rest
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'cursor-not-allowed',
        className
      )}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
