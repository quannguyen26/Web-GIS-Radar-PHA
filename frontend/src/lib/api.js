import axios from "axios";

// Create custom Axios instance
const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Allow cookies to be sent with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// In-memory access token storage
let currentAccessToken = null;

export const setAccessToken = (token) => {
  currentAccessToken = token;
};

export const getAccessToken = () => {
  return currentAccessToken;
};

// Callback invoked when the session can no longer be refreshed (set by AuthProvider)
let onAuthFailure = null;

export const setOnAuthFailure = (callback) => {
  onAuthFailure = callback;
};

// Shared in-flight refresh promise so concurrent callers (StrictMode double
// mount, parallel 401s) trigger only one POST /auth/refresh
let refreshPromise = null;

export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post("/api/auth/refresh", {}, { withCredentials: true })
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// Request interceptor: attach bearer token if available
api.interceptors.request.use(
  (config) => {
    if (currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle automatic token refresh on 401 Unauthorized.
// Concurrent 401s all await the same refreshPromise, so only one
// POST /auth/refresh is sent no matter how many requests fail at once.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints (signin, signup, refresh, signout)
    const isAuthRoute =
      originalRequest?.url?.includes("/auth/signin") ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/signup") ||
      originalRequest?.url?.includes("/auth/signout");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        // Session is no longer valid: let AuthProvider clear the user state
        if (onAuthFailure) onAuthFailure();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
