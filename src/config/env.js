const normalizeBaseUrl = (value) => {
  if (!value) return value;
  const withoutTrailingSlash = value.endsWith('/') ? value.slice(0, -1) : value;
  return withoutTrailingSlash.endsWith('/api')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
};

const ENV = {
  API_BASE_URL: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
  APP_ENV: import.meta.env.VITE_APP_ENV ?? 'development',
  ENABLE_MSW: import.meta.env.VITE_ENABLE_MSW === 'true',
};

if (!ENV.API_BASE_URL) throw new Error('[IndoAlpenVerlag] VITE_API_BASE_URL is required');

export default ENV;
