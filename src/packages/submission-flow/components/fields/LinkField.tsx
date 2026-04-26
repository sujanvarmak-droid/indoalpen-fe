import { FieldConfig } from '../../types/config';

interface LinkFieldProps {
  field: FieldConfig;
  namePrefix?: string;
}

export function LinkField({ field }: LinkFieldProps) {
  return (
    <div className="py-2">
      <p className="mb-1 text-sm font-medium text-gray-700">{field.label}</p>
      <a
        href={field.linkHref ?? field.hint ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-brand underline underline-offset-2 transition-colors hover:text-brand/80"
      >
        View Author Guidelines
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
      {field.hint && field.hint.startsWith('http') === false && <p className="mt-1 text-xs text-gray-500">{field.hint}</p>}
    </div>
  );
}
