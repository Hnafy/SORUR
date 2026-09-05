import axios from 'axios';

export const TOKEN_KEY = 'sorur_tokens';
export const USER_KEY = 'sorur_user';

export const readTokens = () => {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ accessToken, refreshToken }));
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'https://api.freeapi.app/api/v1',
  headers: { 'Content-Type': 'application/json' },
} );

api.interceptors.request.use((config) => {
  const tokens = readTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

const toEnvelopeError = (err) => {
  const status = err.response?.status;
  const body = err.response?.data;
  const message = body?.message || err.message || 'Something went wrong';
  const error = new Error(message);
  error.statusCode = status || (body && body.statusCode) || 500;
  error.success = false;
  error.data = body?.data ?? null;
  error.body = body;
  return error;
};

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(toEnvelopeError(err))
);

export const authApi = {
  register: (payload) => api.post('/users/register', payload),

  login: (email, password) => api.post('/users/login', { email, password }),

  logout: () => api.post('/users/logout'),

  refreshToken: (refreshToken) => api.post('/users/refresh-token', { refreshToken }),

  currentUser: () => api.get('/users/current-user'),
};

export default api;