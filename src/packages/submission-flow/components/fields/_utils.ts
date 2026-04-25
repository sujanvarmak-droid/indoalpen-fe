export const cx = (...classes: (string | false | undefined | null)[]): string =>
  classes.filter(Boolean).join(' ');

export const inputBase =
  'w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors';
export const inputError = 'border-danger bg-red-50 focus:ring-danger/40';
export const inputNormal = 'border-gray-300 bg-white focus:border-brand-light';
export const labelBase = 'mb-1 block text-sm font-medium text-gray-700';
export const errorText = 'mt-1 text-xs text-danger';
export const hintText = 'mt-1 text-xs text-gray-500';
