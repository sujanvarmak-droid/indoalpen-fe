export const cx = (...classes: (string | false | undefined | null)[]): string =>
  classes.filter(Boolean).join(' ');

export const inputBase =
  'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-light/40 focus:border-brand-light transition-colors';
export const inputError = 'border-danger/50 bg-red-50';
export const inputNormal = 'border-gray-200 bg-white hover:border-gray-300';
export const labelBase = 'mb-1.5 block text-sm font-medium text-gray-700';
export const errorText = 'mt-1 text-xs text-red-600';
export const hintText = 'mt-1 text-xs text-gray-500';
