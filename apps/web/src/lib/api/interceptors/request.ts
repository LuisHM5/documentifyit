import { InternalAxiosRequestConfig } from 'axios';
import { getAccessToken } from '../token';

export function requestInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['Content-Type'] = 'application/json';

  return config;
}
