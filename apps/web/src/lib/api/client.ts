import axios, { AxiosInstance, AxiosError } from 'axios';
import { requestInterceptor } from './interceptors/request';
import { responseInterceptor, transformError } from './interceptors/response';

const API_BASE_URL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
    : 'http://localhost:3001/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(requestInterceptor, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return responseInterceptor(error).catch((err: unknown) => {
      return Promise.reject(err instanceof Error ? err : transformError(error));
    });
  },
);
