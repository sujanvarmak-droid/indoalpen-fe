const KEY = 'indoalpen_token';
export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t) => localStorage.setItem(KEY, t);
export const removeToken = () => localStorage.removeItem(KEY);
