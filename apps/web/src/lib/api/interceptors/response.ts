import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiClient } from '../client';
import { getRefreshToken, clearTokens, setAccessToken } from '../token';
import { ApiException } from '../errors';

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: Error | null, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

export function responseInterceptor(error: AxiosError): Promise<AxiosError> {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

  if (error.response?.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${String(token)}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      apiClient
        .post<RefreshResponse>('/auth/refresh', { refreshToken })
        .then((res) => {
          const { accessToken, refreshToken: newRefreshToken } = res.data;
          setAccessToken(accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }
          processQueue(null, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          resolve(apiClient(originalRequest));
        })
        .catch((err: unknown) => {
          processQueue(err as Error, null);
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  }

  return Promise.reject(error);
}

export function transformError(error: AxiosError): ApiException {
  const response = error.response?.data as Record<string, unknown> | undefined;

  return new ApiException(
    error.response?.status ?? 500,
    (response?.message as string) ?? error.message,
    (response?.error as string) ?? 'Error',
  );
}
