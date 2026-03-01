export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
