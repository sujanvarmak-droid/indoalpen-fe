const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const getCookie = (key) => {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${key}=`));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
};

const setCookie = (key, value) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${key}=${encodeURIComponent(value)}; Max-Age=${TOKEN_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
};

const clearCookie = (key) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${key}=; Max-Age=0; Path=/; SameSite=Lax`;
};

export const getAccessToken = () => getCookie(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => getCookie(REFRESH_TOKEN_KEY);

export const setAccessToken = (token) => {
  if (token) {
    setCookie(ACCESS_TOKEN_KEY, token);
  } else {
    clearCookie(ACCESS_TOKEN_KEY);
  }
};

export const setRefreshToken = (token) => {
  if (token) {
    setCookie(REFRESH_TOKEN_KEY, token);
  } else {
    clearCookie(REFRESH_TOKEN_KEY);
  }
};

export const clearAuthTokens = () => {
  clearCookie(ACCESS_TOKEN_KEY);
  clearCookie(REFRESH_TOKEN_KEY);
};
