import axios, { type AxiosError, type AxiosInstance } from "axios";
import { useAuthStore } from "@/stores";

/**
 * httpPublic
 *
 * This client does NOT contain authentication interceptors.
 * It must be used for endpoints that should not depend on accessToken,
 * such as:
 *  - POST /login
 *  - POST /refresh
 *
 * Reason:
 * If /refresh returns 401 and we are using the same axios instance
 * with auth interceptors, we could create an infinite refresh loop.
 */
export const httpPublic: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8089",
  timeout: 15_000,
});

/**
 * http
 *
 * Main HTTP client of the application.
 * It contains:
 *  - Request interceptor (adds Authorization header)
 *  - Response interceptor (handles 401 + refresh flow)
 */
export const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8089",
  timeout: 15_000,
});

/**
 * REQUEST INTERCEPTOR
 *
 * This runs BEFORE every request is sent.
 * It attaches the Bearer access token (if available)
 * to the Authorization header.
 */
http.interceptors.request.use((config) => {
  const auth = useAuthStore();

  if (auth.accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }

  return config;
});

/**
 * Refresh control flags
 *
 * isRefreshing:
 *  Ensures only ONE refresh request runs at a time.
 *
 * failedQueue:
 *  Stores pending requests that failed with 401
 *  while a refresh operation is already in progress.
 */
let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

/**
 * processQueue
 *
 * If refresh succeeds:
 *  - Resolves all queued requests with the new token.
 *
 * If refresh fails:
 *  - Rejects all queued requests with the error.
 */
function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((promise) =>
    error ? promise.reject(error) : promise.resolve(token!)
  );
  failedQueue = [];
}

/**
 * RESPONSE INTERCEPTOR
 *
 * This runs AFTER a response is received.
 *
 * If status is 401:
 *  - Attempt token refresh
 *  - Retry the original request
 */
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const auth = useAuthStore();
    const status = error.response?.status;
    const originalRequest = error.config as any;

    // If error is not 401, just forward it
    if (status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite retry loops
    if (originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If no refresh token exists, we cannot recover the session
    if (!auth.refreshToken) {
      await auth.logout?.();
      return Promise.reject(error);
    }

    /**
     * If a refresh is already running:
     *  - Do not trigger another refresh
     *  - Queue the current request
     */
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(http(originalRequest));
          },
          reject,
        });
      });
    }

    /**
     * Otherwise:
     *  - Start refresh process
     *  - Update token
     *  - Retry original request
     *  - Release queued requests
     */
    isRefreshing = true;

    try {
      // IMPORTANT:
      // refresh() must use httpPublic internally to avoid infinite loops
      const newAccessToken = await auth.refresh(httpPublic);

      processQueue(null, newAccessToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return http(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await auth.logout?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
